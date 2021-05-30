# is-pagelist

pipe:
```javascript
.pipe(listing('page-list.html'))
```

example:
```javascript
const pageList = () => {
  return src('./app/*.html')
    .pipe(listing('page-list.html'))
    .pipe(dest('./app/'));
}
```
