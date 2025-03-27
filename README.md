# KillPhilosophy

![KillPhilosophy Logo](img/logo.png)

An interactive web application for exploring the interconnections between philosophers, critical theorists, and other academics in the humanities. Built with a retro terminal aesthetic using vanilla JavaScript and D3.js for network visualization.

## Features

- **Academic Search**: Find detailed profiles of philosophers and theorists
- **Network Visualization**: Explore connections between academics
- **Database Browser**: Browse all academics alphabetically
- **Novelty Tiles**: Get notifications about newly added content
- **Deep Search**: Find connections that aren't immediately obvious
- **Contribution System**: Add new academics or update existing entries

## Live Demo

Visit [https://your-username.github.io/killphilosophy](https://your-username.github.io/killphilosophy) to see the project in action.

## Installation

To run KillPhilosophy locally:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/killphilosophy.git
   ```

2. Navigate to the project directory:
   ```
   cd killphilosophy
   ```

3. Open `index.html` in your browser, or use a local server:
   ```
   python -m http.server
   ```

4. For the best experience, use a modern browser like Chrome, Firefox, or Edge.

## Usage

### Search

Enter an academic's name in the search box to find their profile. Use the suggestions for quicker access.

### Network Visualization

Click the network icon (◉) on any academic profile to visualize their connections with other academics in the database.

### Deep Search

Use the Deep Search feature to discover connections between academics through AI-powered analysis. Note: This feature requires an API key for full functionality.

### Contribution

Add new academics or update existing entries through the Contribution tab. You can also contribute directly through GitHub.

## Browser Compatibility

KillPhilosophy is designed to work on modern browsers that support ES6, localStorage, and the Fetch API.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## Data Structure

Academic data is stored with the following structure:

```json
{
  "academic-name": {
    "name": "Academic Name",
    "bio": "Biographical information",
    "taxonomies": {
      "discipline": ["Philosophy", "Sociology"],
      "tradition": ["Critical Theory"],
      "era": ["20th Century"],
      "methodology": ["Textual Analysis"],
      "theme": ["Power", "Identity"]
    },
    "papers": [
      { "title": "Paper Title", "year": 2020, "coauthors": ["Co-author Name"] }
    ],
    "events": [
      { "title": "Event Title", "year": 2021, "location": "Location" }
    ],
    "connections": ["Connected Academic 1", "Connected Academic 2"]
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Icon Source](https://iconsource.com)
- Terminal styling inspired by retro computing interfaces
- Academic data compiled from various open educational resources
