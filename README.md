# puppeteer-cli

A command-line wrapper for generating PDF prints and PNG screenshots with [Puppeteer](https://developers.google.com/web/tools/puppeteer).

## Changes from forked project

This project has been forked from https://github.com/JarvusInnovations/puppeteer-cli, which had become unmaintained.

Changes:

- Updated dependencies
- CLI is installed as `puppeteer-cli`, not `puppeteer`, so to not collide with Puppeteer's own CLI
- A strong focus on running under AWS Lambda via AL2  
- README updates

## Install

```bash
npm install -g git+ssh://git@github.com/datalink/puppeteer-cli.git
```

## In Docker

The main usage of this fork is to run within AWS Lambda via Docker.

This Dockerfile has worked. It's based on AmazonLinux AL2. Pay close attention to the yum dependencies.

```
# starting from bref, which is based on provided.al2
# e.g. https://hub.docker.com/_/amazonlinux/tags?page=1&name=2.0
FROM bref/php-74

# Install Bref stuff
...

# Install node 16 for Puppeteer
# We can't go higher due to Amazon Linux 2's version of GCC, but bump this up once bref is based on AL2023+
RUN yum -y update && \
    yum install https://rpm.nodesource.com/pub_16.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y && \
    yum install nodejs -y --setopt=nodesource-nodejs.module_hotfixes=1 && \
    yum clean all

# Install puppeteer CLI dependencies
# @see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch
# @see https://stackoverflow.com/questions/71096906/google-chrome-on-aws-lambda
# @see https://github.com/puppeteer/puppeteer/issues/560#issuecomment-325245136
RUN yum -y update && \
    yum install -y \
        alsa-lib \
        alsa-lib.x86_64 \
        at-spi2-atk \
        atk \
        atk.x86_64 \
        cups-libs \
        cups-libs.x86_64 \
        gtk3 \
        gtk3.x86_64 \
        ipa-gothic-fonts \
        libXScrnSaver \
        libXScrnSaver.x86_64 \
        libXcomposite \
        libXcomposite.x86_64 \
        libXcursor \
        libXcursor.x86_64 \
        libXdamage \
        libXdamage.x86_64 \
        libXext \
        libXext.x86_64 \
        libXi.x86_64 \
        libXrandr \
        libXrandr.x86_64 \
        libXt \
        libXtst \
        libXtst.x86_64 \
        libdrm \
        pango \
        pango.x86_64 \
        shadow-utils \
        xorg-x11-fonts-100dpi \
        xorg-x11-fonts-75dpi \
        xorg-x11-fonts-Type1 \
        xorg-x11-fonts-cyrillic \
        xorg-x11-fonts-misc \
        xorg-x11-server-Xvfb \
        xorg-x11-utils \
        GConf2.x86_64 && \
    yum install -y \
        ipa-gothic-fonts  \
        xorg-x11-fonts-100dpi \
        xorg-x11-fonts-75dpi \
        xorg-x11-fonts-Type1 \
        xorg-x11-fonts-cyrillic \
        xorg-x11-fonts-misc \
        xorg-x11-utils && \
    yum clean all

# Install puppeteer and the latest Chrome
ENV PUPPETEER_CACHE_DIR="/var/puppeteer"
RUN mkdir -p /var/puppeteer && \
    npm i -g puppeteer && \
    puppeteer browsers install chrome@stable
    
# Now install puppeteer-cli, which provides a thin wrapper
RUN yum update -y && \
    yum install -y git && \
    npm i -g git+ssh://git@github.com/datalink/puppeteer-cli.git && \
    yum remove -y git && \
    yum clean all

...

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
