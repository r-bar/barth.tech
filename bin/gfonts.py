#!/usr/bin/env python3

import re
from argparse import ArgumentParser
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlsplit
from pathlib import Path

import requests


def cli():
    p = ArgumentParser('Download a google font assets locally')
    p.add_argument('google_fonts_url')
    p.add_argument('output_dir', type=Path)
    p.add_argument('--base-url', default='/static/vendor/fonts')
    p.add_argument('--css-filename', default='fonts.css')
    return p


def css_font_urls(css):
    return re.findall(r'https://.*\.ttf', css)


def download_font(session: requests.Session, output_dir: Path, url: str):
    url_parts = urlsplit(url)
    font_family_version_file = Path(url_parts.path).parts[2:]
    output_file = output_dir.joinpath(*font_family_version_file)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    resp = session.get(url)
    resp.raise_for_status()
    with open(output_file, 'wb') as f:
        f.write(resp.content)
    return output_file


def rewrite_css(css: str, base_url: str):
    new_css, _num_subs = re.subn(r'https://fonts.gstatic.com/s', base_url, css)
    return new_css


def main():
    args = cli().parse_args()
    resp = requests.get(args.google_fonts_url)
    resp.raise_for_status()
    css = resp.text
    font_urls = css_font_urls(css)
    # import ipdb; ipdb.set_trace()
    session = requests.Session()
    futures = set()
    with ThreadPoolExecutor() as e:
        for url in font_urls:
            futures.add(e.submit(download_font, session, args.output_dir, url))
        for future in as_completed(futures):
            if exc := future.exception():
                raise exc
    with open(args.output_dir / args.css_filename, 'w') as f:
        f.write(rewrite_css(css, args.base_url))


if __name__ == '__main__':
    main()
