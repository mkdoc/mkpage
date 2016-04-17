## Example

Create an HTML page:

```shell
mkcat README.md | mkpage --title=README | mkhtml > README.html
```

Use a stylesheet:

```shell
mkcat README.md | mkpage --title=README --style=style.css | mkhtml > README.html
```
