# ML Engineer Path — Article Plan

## Overview

The **ML Engineer** learning path (`/learning-paths/ml-engineer`) targets ML engineer roles at fintech and applied-AI companies where classical ML, statistics, and ML system design matter as much as LLMs. It shares foundational series with the AI Engineer path (math, AI fundamentals, transformers, production) and adds three ML-specific series.

- Path color: **green** (Rule 01 §7, one color per path)
- Category for all ML articles: `machine-learning`
- Badges: `📊 ML Engineer` (green) / `🤖 AI Engineer` (purple) / `Fundamental` mark role relevance on shared articles

## Path order

1. statistics-probability *(new, this plan)*
2. essence-of-linear-algebra *(shared with ai-engineer)*
3. essence-of-calculus *(shared)*
4. classical-ml *(new, this plan)*
5. ai-fundamentals *(shared)*
6. applied-ml-systems *(new, this plan)*
7. transformers-llms *(shared)*
8. production-ai-engineering *(shared)*

## Article status

### Series: Statistics & Probability (`statistics-probability`)

| # | Article | Slug | Status |
|---|---------|------|--------|
| 1 | Probability: The Language of Uncertainty | sp-probability-basics | DONE |
| 2 | Random Variables & Distributions | sp-random-variables-distributions | DONE |
| 3 | Bayes' Theorem & Conditional Probability | sp-bayes-theorem | DONE |
| 4 | Descriptive Statistics & Sampling | sp-descriptive-statistics-sampling | DONE |
| 5 | Hypothesis Testing & Confidence Intervals | sp-hypothesis-testing | DONE |
| 6 | Maximum Likelihood Estimation | sp-maximum-likelihood-estimation | DONE |
| 7 | The Bias-Variance Tradeoff | sp-bias-variance-tradeoff | DONE |

### Series: Classical Machine Learning (`classical-ml`)

| # | Article | Slug | Status |
|---|---------|------|--------|
| 1 | Linear Regression: Where ML Begins | linear-regression | DONE |
| 2 | Logistic Regression & Classification | logistic-regression-classification | DONE |
| 3 | Decision Trees | decision-trees | DONE |
| 4 | Ensembles: Random Forest to XGBoost | ensembles-random-forest-xgboost | DONE |
| 5 | SVM & k-Nearest Neighbors | svm-and-knn | DONE |
| 6 | Clustering: k-Means & Beyond | clustering-kmeans | DONE |
| 7 | PCA & Dimensionality Reduction | pca-dimensionality-reduction | DONE |
| 8 | Feature Engineering | feature-engineering | DONE |
| 9 | Model Evaluation: Precision, Recall & ROC-AUC | model-evaluation-metrics | DONE |
| 10 | Cross-Validation & Imbalanced Data | cross-validation-imbalanced-data | DONE |

### Series: Applied ML Systems (`applied-ml-systems`)

| # | Article | Slug | Status |
|---|---------|------|--------|
| 1 | Fraud Detection with ML | fraud-detection-with-ml | DONE |
| 2 | Credit Scoring & Risk Models | credit-scoring-risk-models | DONE |
| 3 | Recommender Systems | recommender-systems | DONE |
| 4 | Time-Series Forecasting | time-series-forecasting | DONE |
| 5 | The ML System Design Interview | ml-system-design-interview | DONE |

## Conventions (Rule 01 §6-7, Rule 04)

- Files: `src/content/articles/ml-engineer/<series-slug>/<NN>-<slug>.mdx`
- Frontmatter: `category: machine-learning`, `color: green`, `series` + `seriesOrder` set, dates full ISO 8601, no manual `readTime`
- Tone: conversational, fintech-flavored examples (fraud, credit scoring, BNPL), avoid em dashes in body prose
- After each article ships: flip status TODO → DONE here, keep `public/llms.txt` current
