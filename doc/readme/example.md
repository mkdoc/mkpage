## Example

Create an HTML page:

```shell
mkcat README.md | mkpage --title=README | mkout -H > README.html
```

Use a stylesheet:

```shell
mkcat README.md | mkpage --title=README --style=style.css | mkout -H > README.html
```
