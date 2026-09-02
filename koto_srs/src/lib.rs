use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;

/// A flashcard whose review schedule is managed by the SM-2 algorithm.
///
/// After construction all fields hold their initial values:
/// `easiness_factor = 2.5`, `interval = 0`, `repetitions = 0`.
#[pyclass(skip_from_py_object)]
struct Card {
    easiness_factor: f64,
    interval: f64,
    repetitions: u32,
}

#[pymethods]
impl Card {
    #[new]
    #[pyo3(signature = (easiness_factor=None, interval=None, repetitions=None))]
    fn new(
        easiness_factor: Option<f64>,
        interval: Option<f64>,
        repetitions: Option<u32>,
    ) -> PyResult<Self> {
        if let Some(ef) = easiness_factor {
            if !(1.0..=2.99).contains(&ef) {
                return Err(PyValueError::new_err(
                    "easiness_factor must be in the range 1.0-2.99",
                ));
            }
        }
        Ok(Self {
            easiness_factor: easiness_factor.unwrap_or(2.5),
            interval: interval.unwrap_or(0.0),
            repetitions: repetitions.unwrap_or(0),
        })
    }

    /// Records a review graded `quality` (0-5) and updates the SM-2 state.
    /// Returns the new interval in days.
    fn grade(&mut self, quality: u8) -> PyResult<f64> {
        if quality > 5 {
            return Err(PyValueError::new_err("quality must be in the range 0-5"));
        }

        if quality < 3 {
            self.repetitions = 0;
            self.interval = 1.0;
        } else {
            match self.repetitions {
                0 => self.interval = 1.0,
                1 => self.interval = 6.0,
                _ => self.interval = (self.interval * self.easiness_factor).round(),
            }
            self.repetitions += 1;
        }

        let q = quality as f64;
        self.easiness_factor = (self.easiness_factor + (0.1 - (5.0 - q) * (0.08 + (5.0 - q) * 0.02)))
            .max(1.3);

        Ok(self.interval)
    }

    #[getter]
    fn easiness_factor(&self) -> f64 {
        self.easiness_factor
    }

    #[getter]
    fn interval(&self) -> f64 {
        self.interval
    }

    #[getter]
    fn repetitions(&self) -> u32 {
        self.repetitions
    }

    /// Resets the card to its initial SM-2 state.
    fn reset(&mut self) {
        self.easiness_factor = 2.5;
        self.interval = 0.0;
        self.repetitions = 0;
    }

    fn __repr__(&self) -> String {
        format!(
            "Card(easiness_factor={:.4}, interval={}, repetitions={})",
            self.easiness_factor, self.interval, self.repetitions
        )
    }
}

/// A Python module implemented in Rust.
#[pymodule]
fn koto_srs(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Card>()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::Card;

    #[test]
    fn initial_state() {
        let c = Card::new(None, None, None).unwrap();
        assert!((c.easiness_factor - 2.5).abs() < f64::EPSILON);
        assert_eq!(c.interval, 0.0);
        assert_eq!(c.repetitions, 0);
    }

    #[test]
    fn low_quality_resets_and_sets_interval_one() {
        let mut c = Card::new(None, None, None).unwrap();
        c.grade(4).unwrap();
        c.grade(5).unwrap();
        assert_eq!(c.repetitions, 2);
        // Quality < 3 resets repetitions and pins the interval at 1 day.
        c.grade(1).unwrap();
        assert_eq!(c.repetitions, 0);
        assert_eq!(c.interval, 1.0);
    }

    #[test]
    fn first_review_interval_is_one_day() {
        // When repetitions starts at zero, the first successful review
        // always yields a 1-day interval, regardless of other state.
        for &ef in &[1.3, 2.0, 2.5] {
            let mut c = Card::new(Some(ef), Some(10.0), Some(0)).unwrap();
            c.grade(4).unwrap();
            assert_eq!(c.interval, 1.0);
        }
    }

    #[test]
    fn second_review_interval_is_six_days() {
        let mut c = Card::new(None, None, None).unwrap();
        c.grade(4).unwrap();
        c.grade(5).unwrap();
        assert_eq!(c.interval, 6.0);
        assert_eq!(c.repetitions, 2);
    }

    #[test]
    fn interval_grows_with_easiness_factor() {
        let mut c = Card::new(Some(2.5), Some(6.0), Some(2)).unwrap();
        c.grade(5).unwrap();
        assert_eq!(c.interval, 15.0);
    }

    #[test]
    fn easiness_factor_floored_at_one_point_three() {
        let mut c = Card::new(Some(1.3), Some(1.0), Some(1)).unwrap();
        for _ in 0..10 {
            c.grade(0).unwrap();
        }
        assert_eq!(c.easiness_factor, 1.3);
    }

    #[test]
    fn easiness_factor_never_exceeds_two_point_nine() {
        let mut c = Card::new(Some(2.0), Some(1.0), Some(1)).unwrap();
        c.grade(5).unwrap();
        assert!(c.easiness_factor <= 2.5);
    }

    #[test]
    fn quality_out_of_range_rejected() {
        let mut c = Card::new(None, None, None).unwrap();
        assert!(c.grade(6).is_err());
    }

    #[test]
    fn easiness_out_of_range_rejected() {
        assert!(Card::new(Some(0.5), None, None).is_err());
        assert!(Card::new(Some(3.0), None, None).is_err());
    }

    #[test]
    fn reset_restores_defaults() {
        let mut c = Card::new(None, None, None).unwrap();
        c.grade(5).unwrap();
        c.grade(5).unwrap();
        c.reset();
        assert!((c.easiness_factor - 2.5).abs() < f64::EPSILON);
        assert_eq!(c.interval, 0.0);
        assert_eq!(c.repetitions, 0);
    }
}
