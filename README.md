# aa.LevelViewer
aa.LevelViewer is a simple web app written in Javascript to step through image series by index or by level.  
(View on [Github](https://github.com/aantin/js-aaLevelViewer-dev))

### Usage:
```js
LevelViewer
.load({
    title: "My title",
    series: [
        {
            name: "My series",
            archive: "my-series/my-series-archive.zip",
            levels: [
                {
                    name: "First Level name",
                    sources: [
                        "my-series/first-level-path/a-first-image.jpg",
                        "my-series/first-level-path/a-second-image.jpg",
                        "my-series/first-level-path/a-third-image.jpg",
                        // ...
                    ]
                },
                {
                    name: "Second Level name",
                    sources: [
                        "my-series/second-level-path/a-first-image.jpg",
                        "my-series/second-level-path/a-second-image.jpg",
                        "my-series/second-level-path/a-third-image.jpg",
                        // ...
                    ]
                },
            ]
        },
    ]
})
.render();
```
