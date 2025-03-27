# Contributing to KillPhilosophy

Thank you for your interest in contributing to KillPhilosophy! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

There are several ways to contribute to KillPhilosophy:

### 1. Adding Academic Data

The most valuable contribution is expanding our database of academics:

- Use the Contribution form in the application
- Submit a pull request with updates to `data/academics.json`
- Ensure data follows the established schema (see below)

### 2. Reporting Bugs

If you find a bug or issue:

1. Check if the bug has already been reported in the [Issues](https://github.com/your-username/killphilosophy/issues)
2. If not, open a new issue with a clear title and description
3. Include steps to reproduce the bug and information about your browser/environment
4. Add the "bug" label

### 3. Suggesting Enhancements

For feature requests:

1. Open a new issue with the "enhancement" label
2. Clearly describe the feature and why it would be valuable
3. Indicate if you're willing to implement it yourself

### 4. Code Contributions

For code contributions:

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Test thoroughly in multiple browsers
5. Submit a pull request referencing the issue it addresses

## Academic Data Schema

When adding or updating academic data, please follow this schema:

```json
{
  "normalized-name": {
    "name": "Full Name",
    "bio": "Brief biographical description",
    "taxonomies": {
      "discipline": ["Philosophy", "Sociology"],
      "tradition": ["Critical Theory", "Marxism"],
      "era": ["20th Century", "Contemporary"],
      "methodology": ["Textual Analysis", "Dialectical Method"],
      "theme": ["Power", "Identity", "Language"]
    },
    "papers": [
      {
        "title": "Paper Title",
        "year": 2020,
        "coauthors": ["Co-author Name"]
      }
    ],
    "events": [
      {
        "title": "Event Title",
        "year": 2021,
        "location": "Location Name"
      }
    ],
    "connections": ["Connected Academic 1", "Connected Academic 2"]
  }
}
```

### Notes on Data Format:

- The key should be a normalized version of the name (lowercase, spaces replaced with hyphens, no special characters)
- All fields except `name` are optional, but encouraged
- Taxonomy values should match existing values when possible
- Connections should reference other academics in the database when possible

## Development Setup

1. Clone the repository
2. Open `index.html` in your browser or use a local server
3. No build process is required as the application uses vanilla JavaScript

## Pull Request Process

1. Ensure your code follows the existing style and conventions
2. Update documentation if necessary
3. Test your changes in multiple browsers
4. Submit the pull request with a clear description of the changes

## Style Guidelines

- Follow existing code style and conventions
- Use semantic HTML
- Keep CSS organized by component
- Use clear and descriptive variable/function names
- Add comments for complex logic

## Contact

If you have questions about contributing, please open an issue labeled "question" or contact the project maintainers.

Thank you for helping improve KillPhilosophy!
