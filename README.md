# Poki Playtest Data Scraper

The Poki Playtest Data Scraper is a Chrome extension that allows you to extract and export playtest data from the Poki platform into a CSV file.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

## Installation

To install the Poki Playtest Data Scraper Chrome extension, follow these steps:

1. **Download the Extension:**
   - Clone this repository or download it as a ZIP file to your local machine.

2. **Open Chrome Extensions:**
   - Open a new tab in Google Chrome and navigate to `chrome://extensions/`.

3. **Enable Developer Mode:**
   - In the top-right corner of the extensions page, toggle on "Developer mode".

4. **Load the Extension:**
   - Click on the "Load unpacked" button that appears.
   - Select the folder where you cloned or extracted the extension files (`manifest.json` should be directly inside this folder).

5. **Verify Installation:**
   - The Poki Playtest Data Scraper extension icon should now appear in your browser toolbar, next to the address bar.

## Usage

Once the extension is installed, follow these steps to use it:

1. **Navigate to the Poki Playtests Page**:
    - Visit a URL that starts with `https://app.poki.dev` and ends with `/playtests`.

2. **Open the Extension Popup**:
    - Click on the Poki Playtest Data Scraper extension icon in the toolbar to open the popup.

3. **Scan for Data**:
    - Click on the "SCAN" button in the popup to scan the page for playtest data. The extension will check the URL to ensure it's on the Playtests page. If the URL is correct, it will start scanning and counting the data sets found.

4. **Export Data to CSV**:
    - Once scanning is complete, and if data is found, the popup will display a dropdown menu labeled "versions", an "EXPORT" button, and an "EXPORT ALL" button.
    - **Export Specific Version**:
        - Select a version from the dropdown menu and click on the "EXPORT" button to export only the data corresponding to the selected version into a CSV file named `playtest_data.csv`.
    - **Export All Data**:
        - Click on the "EXPORT ALL" button to export all the playtest data found into a CSV file named `all_playtest_data.csv`.

5. **Access the CSV File**:
    - The CSV file will be automatically downloaded. You can find it in your computer's default download location.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
All assets in the images folder are copyrighted by Poki.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
