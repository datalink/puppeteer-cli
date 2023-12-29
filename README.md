# puppeteer-cli

A command-line wrapper for generating PDF prints and PNG screenshots with [Puppeteer](https://developers.google.com/web/tools/puppeteer).

## Changes from forked project

This project has been forked from https://github.com/JarvusInnovations/puppeteer-cli, which had become unmaintained.

Changes:

- Updated dependencies
- CLI is installed as `puppeteer-cli`, not `puppeteer`, so to not collide with Puppeteer's own CLI
- AWS Lambda support with some additional chrome flags  

## Install

```bash
npm install -g git+https://datalink/puppeteer-cli.git
```

## Usage

```bash
puppeteer-cli print <url> [output]

Print an HTML file or URL to PDF

Options:
  --version                Show version number                         [boolean]
  --help                   Show help                                   [boolean]
  --sandbox                                            [boolean] [default: true]
  --timeout                                            [number] [default: 30000]
  --wait-until                                        [string] [default: "load"]
  --cookie                 Set a cookie in the form "key:value". May be repeated
                           for multiple cookies.                        [string]
  --background                                         [boolean] [default: true]
  --margin-top                                               [default: "6.25mm"]
  --margin-right                                             [default: "6.25mm"]
  --margin-bottom                                           [default: "14.11mm"]
  --margin-left                                              [default: "6.25mm"]
  --format                                                   [default: "Letter"]
  --landscape                                         [boolean] [default: false]
  --display-header-footer                             [boolean] [default: false]
  --header-template                                       [string] [default: ""]
  --footer-template                                       [string] [default: ""]
```

```bash
puppeteer-cli screenshot <url> [output]

Take screenshot of an HTML file or URL to PNG

Options:
  --version          Show version number                               [boolean]
  --help             Show help                                         [boolean]
  --sandbox                                            [boolean] [default: true]
  --timeout                                            [number] [default: 30000]
  --wait-until                                        [string] [default: "load"]
  --cookie           Set a cookie in the form "key:value". May be repeated for
                     multiple cookies.                                  [string]
  --full-page                                          [boolean] [default: true]
  --omit-background                                   [boolean] [default: false]
  --viewport         Set viewport to a given size, e.g. 800x600         [string]
```

## Example

``` shell
echo "<h1>Hello world!</h1>" > mypage.html
puppeteer-cli print mypage.html myprint.pdf # local file
puppeteer-cli print https://github.com/JarvusInnovations/puppeteer-cli puppeteer-cli.pdf # url
puppeteer-cli screenshot mypage.html myscreenshot.png # local file
puppeteer-cli screenshot https://jarv.us myscreenshot.png # url
puppeteer-cli screenshot https://jarv.us myscreenshot.png --viewport 300x200
```

## Credits

Thanks to https://github.com/JarvusInnovations/puppeteer-cli for the original project.
