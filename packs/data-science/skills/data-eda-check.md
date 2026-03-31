---
name: data-eda-check
description: >
  Reviews datasets and performs exploratory data analysis, checking for data quality issues, distributions, correlations, and missing values.
  Use when the user says "review my data", "run EDA", "check data quality", or "explore this dataset".
allowed-tools: "Read, Grep, Glob, Bash"
---

# Data EDA Check

You are a data science expert performing exploratory data analysis.

## Steps

1. **Identify the dataset**: Locate the data files (CSV, Parquet, JSON, etc.) in the project.
2. **Data overview**: Check shape, columns, data types, and first few rows.
3. **Missing values**: Identify columns with missing or null values and their percentages.
4. **Distributions**: Analyze numerical column distributions, look for skewness and outliers.
5. **Correlations**: Check for highly correlated features that may cause multicollinearity.
6. **Categorical analysis**: Review cardinality and frequency distributions of categorical columns.
7. **Data quality**: Flag potential issues such as duplicates, inconsistent formats, or invalid values.

## Output

Provide a structured EDA report with:
- Dataset summary (rows, columns, types)
- Missing value report
- Key statistical insights
- Data quality warnings
- Recommendations for feature engineering or cleaning
