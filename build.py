import os
from bs4 import BeautifulSoup, Tag
from copy import copy

from config import *

def main() -> None:
    generate(CONFIG)

def generate(config: Config) -> None:
    globalImports: GlobalImports = getGlobalImports(config)
    pages: dict[str, BeautifulSoup] = getSoups(config.pageDirectoryPath)
    generatePage(BeautifulSoup(
        """
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
            </body>
        </html>
        """, "html.parser"), "", globalImports, config)
    for name, soup in pages.items():
        generatePage(soup, name, globalImports, config)

class GlobalImports:
    def __init__(self, head: list[BeautifulSoup], body: list[BeautifulSoup]) -> None:
        self.head: list[BeautifulSoup] = head
        self.body: list[BeautifulSoup] = body

def getGlobalImports(config: Config, parser: str="html.parser") -> GlobalImports:
    libraries: list[BeautifulSoup] = list(getSoups(config.libraryDirectoryPath, parser).values())
    interfaces: list[BeautifulSoup] = list(getSoups(config.interfaceDirectoryPath, parser).values())
    styles: list[BeautifulSoup] = []
    for name in os.listdir(config.styleDirectoryPath):
        if name.endswith(".css"):
            styles.append(getStyleTag(config.websiteRootDirectoryPath + config.styleDirectoryPath + name))
    scripts: list[BeautifulSoup] = []
    for name in os.listdir(config.scriptDirectoryPath):
        if name.endswith(".js"):
            scripts.append(getScriptTag(config.websiteRootDirectoryPath + config.scriptDirectoryPath + name))
    return GlobalImports(libraries + styles + scripts, interfaces)

def getSoups(directoryPath: str, parser: str="html.parser") -> dict[str, BeautifulSoup]:
    soups: dict[str, BeautifulSoup] = {}
    for name in os.listdir(directoryPath):
        if name.endswith(".html"):
            with open(directoryPath + name, encoding="UTF-8") as file:
                soups[name[0: len(name) - 5]] = BeautifulSoup(file, parser)
    return soups

def generatePage(soup: BeautifulSoup, name: str, globalImports: GlobalImports, config: Config) -> None:
    if soup.html is None:
        soup.append(soup.new_tag("html"))
    if soup.head is None:
        soup.html.append(soup.new_tag("head"))
    if soup.title is None:
        soup.head.append(soup.new_tag("title"))
    if soup.title.string is None:
        soup.title.string = config.titleAfter
    elif soup.title.string != config.titleAfter:
        soup.title.string += config.titleConnector + config.titleAfter
    for child in soup.find_all(True):
        for key, value in child.attrs.items():
            if len(value) > 0 and value[0] == "/":
                child[key] = config.websiteRootDirectoryPath + value[1: len(value)]
    iconTag: Tag = soup.new_tag("link")
    iconTag["rel"] = "shortcut icon"
    iconTag["href"] = config.websiteRootDirectoryPath + config.iconFilePath
    soup.head.append(iconTag)
    for head in globalImports.head:
        soup.head.append(copy(head))
    if soup.body is None:
        soup.append(soup.new_tag("body"))
    if name != "":
        try:
            for styleName in os.listdir(config.styleDirectoryPath + name):
                soup.body.append(getStyleTag(config.websiteRootDirectoryPath + config.styleDirectoryPath + name + "/" + styleName))
        except FileNotFoundError:
            pass
        try:
            for scriptName in os.listdir(config.scriptDirectoryPath + name):
                soup.body.append(getScriptTag(config.websiteRootDirectoryPath + config.scriptDirectoryPath + name + "/" + scriptName))
        except FileNotFoundError:
            pass
    page: Tag = soup.body
    page.name = "div"
    page["class"] = "page"
    soup.html.append(soup.new_tag("body"))
    for body in globalImports.body:
        soup.body.insert(0, copy(body))
    soup.body.append(page)
    if name == "":
        with open("index.html", "w", encoding="UTF-8") as file:
            file.write(str(soup))
    else:
        try:
            os.makedirs(name)
        except FileExistsError:
            pass
        with open(name + "/index.html", "w", encoding="UTF-8") as file:
            file.write(str(soup))

def getStyleTag(path: str) -> Tag:
    return BeautifulSoup(f"<link rel=\"stylesheet\" href=\"{path}\">", "html.parser")

def getScriptTag(path: str) -> Tag:
    return BeautifulSoup(f"<script src=\"{path}\"></script>", "html.parser")

if __name__ == "__main__":
    main()
