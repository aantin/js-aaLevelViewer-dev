"use strict"; // é
/*
    name:           aaLevelViewer
    description:    aaLevelViewer is a simple web app written in Javascript to step through image series by index or by level

    author:         Antoine ANTIN
    creation date:  2024-03-21
    repository:     https://github.com/aantin/js-aaLevelViewer-dev
*/
(() => {
    const ENV = {
        APP_NAME: "aaLevelViewer",
    };
    const $$ = aa.html;
    // --------------------------------
    function __ (txt, lang="en") {
        aa.arg.test(txt, aa.nonEmptyString, "'txt'");
        const langs = {
            en: {},
            fr: {},
        };
        return langs[lang]?.[txt] ?? txt;
    }
    // --------------------------------
    const Level = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function Level () { get(Level, "construct").apply(this, arguments); }
        const blueprint = {
            accessors: {
                publics: {
                    name:       null,
                    sources:    null,
                },
            },
            construct: function () {
                const that = _(this);
                that.sources = new aa.Collection({authenticate: aa.nonEmptyString});
            },
            methods: {
                privates: {
                },
                publics: {
                },
                setters: {
                    sources: function (sources) {
                        const that = _(this);
                        that.sources.push(...sources);
                    },
                },
            },
            verifiers: {
                name:       aa.nonEmptyString,
                sources:    aa.isArrayLike,
            },
        };
        aa.manufacture(Level, blueprint, {cut, get, set});
        return Level;
    })();
    const Series = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function Series () { get(Series, "construct").apply(this, arguments); }
        const blueprint = {
            accessors: {
                publics: {
                    archive:    null,
                    name:       null,
                    levels:     null,
                },
            },
            construct: function () {
                const that = _(this);
                that.levels = new aa.Collection({authenticate: aa.instanceof(Level)});
            },
            methods: {
                privates: {
                },
                publics: {
                },
                setters: {
                    levels: function (levels) {
                        const that = _(this);
                        levels = levels.map(level => level instanceof Level ? level : new Level(level));
                        that.levels.push(...levels);
                    },
                },
            },
            verifiers: {
                archive:    aa.nonEmptyString,
                name:       aa.nonEmptyString,
                levels:     aa.isArrayLike,
            },
        };
        aa.manufacture(Series, blueprint, {cut, get, set});
        return Series;
    })();
    const LevelViewer = (() => {
        const {cut, get, set} = aa.mapFactory();
        function _ (that) { return aa.getAccessor.call(that, {cut, get, set}); }
        function LevelViewer () { get(LevelViewer, "construct").apply(this, arguments); }
        const privates = {
            singleton: null,
        };
        const blueprint = {
            accessors: {
                publics: {
                    series: null,
                    title:  null,
                },
            },
            construct: function () {
                const that = _(this);
                that.series = new aa.Collection({authenticate: aa.instanceof(Series)});
            },
            methods: {
                privates: {
                    loadSources: function (options) {
                        aa.arg.test(options, aa.verifyObject({
                            resolve:    aa.isFunction,
                            reject:     aa.isFunction,
                        }), "'options'");
                        const that = _(this);

                        const loading = document.querySelector("#loading");
                        if (!loading) return;

                        const toLoad = {};
                        that.series.forEach(serie => {
                            serie.levels.forEach(level => {
                                level.sources.forEach(src => {
                                    toLoad[src] = false;
                                });
                            });
                        });
                        const sources = Object.keys(toLoad);
                        const total = sources.length;
                        if (total === 0) {
                            loading.innerHTML = __("Source not found");
                            return;
                        }

                        // Display a progress bar:
                        const progress = $$("div.progress", {dataset: {percent: "0 %"}});
                        loading.append(progress);

                        setTimeout(() => {
                            const updateProgress = percent => {
                                requestAnimationFrame(() => {
                                    progress.style.borderRightWidth = `${240 * (1 - percent)}px`;
                                    progress.style.borderLeftWidth = `${240 * percent}px`;
                                    progress.dataset.percent = `${Math.floor(100 * percent)} %`;

                                    if (percent === 1) {
                                        requestAnimationFrame(() => {
                                            options.resolve?.();
                                        });
                                    }
                                });
                            };
                            sources.forEach(src => {
                                const img = new Image();
                                img.addEventListener("load", e => {
                                    toLoad[src] = true;
                                    const count = Object.keys(toLoad).filter(key => toLoad[key] === true).length;
                                    const percent = count / total;
                                    updateProgress(percent);
                                });
                                img.src = src;
                            });

                        }, 500);
                    },
                },
                publics: {
                    load:   function (data={}) {
                        aa.arg.test(data, aa.verifyObject({
                            series: blueprint.verifiers.series,
                            title: blueprint.verifiers.title,
                        }), "'data'");
                        data.sprinkle({
                            series: [],
                            title: null
                        });
                        const that = _(this);
                        data.series = data.series.map(serie => serie instanceof Series ? serie : new Series(serie));
                        that.series.push(...data.series);
                        that.title = data.title;
                    },
                    render: function () {
                        const that = _(this);
                        const body = document.body;

                        if (that.title) document.title = `${that.title} | ${ENV.APP_NAME}`;
                        
                        let seriesIndex = -1;
                        let imgIndex = -1;
                        let levelIndex = -1;
                        
                        let currentSeries = that.series.first;
                        let currentLevel = currentSeries.levels?.first;
                        if (!currentSeries) {
                            document.querySelector("#loading").innerHTML = __(`Series not found`);
                            return;
                        }

                        ({
                            "image-next": {
                                description: __("Next image"),
                                shortcut: "<Right>",
                                on: {execute:  e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    imgIndex++;
                                    actions.update();
                                    actions.flash(document.querySelector("#right"));
                                }},
                            },
                            "image-previous": {
                                description: __("Previous image"),
                                shortcut: "<Left>",
                                on: {execute: e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    imgIndex--;
                                    actions.update();
                                    actions.flash(document.querySelector("#left"));
                                }},
                            },
                            "level-next": {
                                description: __("Next level"),
                                shortcut: "<Down>",
                                on: {execute: e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    levelIndex++;
                                    actions.update();
                                    actions.flash(document.querySelector("#down"));
                                }},
                            },
                            "level-previous": {
                                description: __("Previous level"),
                                shortcut: "<Up>",
                                on: {execute: e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    levelIndex--;
                                    actions.update();
                                    actions.flash(document.querySelector("#up"));
                                }},
                            },
                            "series-next": {
                                description: __("Next series"),
                                shortcut: "<PageDown>",
                                on: {execute: e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    seriesIndex++;
                                    if (that.series.length > 1) {
                                        imgIndex = 0;
                                        levelIndex = 0;
                                    }
                                    actions.update();
                                    actions.flash(document.querySelector("#page-down"));
                                }}
                            },
                            "series-previous": {
                                description: __("Previous series"),
                                shortcut: "<PageUp>",
                                on: {execute: e => {
                                    e?.preventDefault();
                                    e?.stopPropagation();
                                    seriesIndex--;
                                    if (that.series.length > 1) {
                                        imgIndex = 0;
                                        levelIndex = 0;
                                    }
                                    actions.update();
                                    actions.flash(document.querySelector("#page-up"));
                                }}
                            },
                        }).forEach((spec, name) => {
                            spec.sprinkle({
                                name,
                                app: ENV.APP_NAME,
                            });
                            const shortcut = spec.shortcut;
                            if (shortcut) {
                                delete spec.shortcut;
                            }
                            const action = new aa.Action(spec);
                            if (shortcut) {
                                aa.events.app(ENV.APP_NAME).on(shortcut, action);
                            }
                        });

                        const actions = {
                            flash: btn => {
                                btn?.classList.add("flash");
                                aa.wait(400, () => {
                                    btn?.classList.remove("flash");
                                });
                            },
                            start: () => {
                                seriesIndex = 0;
                                imgIndex = 0;
                                levelIndex = 0;

                                const loading = document.querySelector("#loading");
                                loading?.parentNode?.removeChild(loading);

                                body.style.backgroundImage = `url(${currentLevel.sources[imgIndex]})`;
                                body.append($$("aside.bottom",
                                    $$(`button#page-up.icon${that.series.length < 2 ? '.hidden' : ''}`, $$("icon.step-backward") /* ⇞ */, {
                                        disabled: that.series.length < 2,
                                        on: {click: e => {
                                            aa.action("series-previous", a => a.execute(e));
                                        }}},
                                        $$("tooltip", {
                                            text: __("Previous series"),
                                            direction: "bottom-right",
                                            shortcut: aa.shortcut.format(aa.action("series-previous").shortcut, ["simple"])
                                        })
                                    ),
                                    $$("h1#series-name", currentSeries.name),
                                    $$(`button#page-down.icon${that.series.length < 2 ? '.hidden' : ''}`, $$("icon.step-forward") /* ⇟ */, {
                                        disabled: that.series.length < 2,
                                        on: {click: e => {
                                            aa.action("series-next", a => a.execute(e));
                                        }}},
                                        $$("tooltip", {
                                            text: __("Next series"),
                                            direction: "bottom-left",
                                            shortcut: aa.shortcut.format(aa.action("series-next").shortcut, ["simple"])
                                        })
                                    ),
                                ));
                                body.append($$("aside.top",
                                    $$("table",
                                        $$("tr",
                                            $$("td"),
                                            $$("td", $$("button#up.icon", $$("span.fa.fa-fw.fa-chevron-up"), {
                                                title: `${aa.action("level-previous").description} ${aa.shortcut.format(aa.action("level-previous").shortcut, ["simple"])}`,
                                                on: {click: e => {
                                                    levelIndex--;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                text: __(aa.action("level-previous").description),
                                                direction: "right",
                                                shortcut: aa.shortcut.format(aa.action("level-previous").shortcut, ["simple"]),
                                            }))),
                                        ),
                                        $$("tr",
                                            $$("td", $$("button#left.icon", $$("span.fa.fa-fw.fa-chevron-left"), {
                                                title: `${aa.action("image-previous").description} ${aa.shortcut.format(aa.action("image-previous").shortcut, ["simple"])}`,
                                                on: {click: e => {
                                                    imgIndex--;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                text: __(aa.action("image-previous").description),
                                                direction: "bottom",
                                                shortcut: aa.shortcut.format(aa.action("image-previous").shortcut, ["simple"]),
                                            }))),
                                            $$("td", $$("button#down.icon", $$("span.fa.fa-fw.fa-chevron-down"), {
                                                title: `${aa.action("level-next").description} ${aa.shortcut.format(aa.action("level-next").shortcut, ["simple"])}`,
                                                on: {click: e => {
                                                    levelIndex++;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                text: __(aa.action("level-next").description),
                                                direction: "bottom",
                                                shortcut: aa.shortcut.format(aa.action("level-next").shortcut, ["simple"]),
                                            }))),
                                            $$("td", $$("button#right.icon", $$("span.fa.fa-fw.fa-chevron-right"), {
                                                title: `${aa.action("image-next").description} ${aa.shortcut.format(aa.action("image-next").shortcut, ["simple"])}`,
                                                on: {click: e => {
                                                    imgIndex++;
                                                    actions.update();
                                                }}
                                            }, $$("tooltip", {
                                                text: __(aa.action("image-next").description),
                                                direction: "bottom",
                                                shortcut: aa.shortcut.format(aa.action("image-next").shortcut, ["simple"]),
                                            }))),
                                        ),
                                    ),
                                    $$("h1#label", currentLevel.name),
                                    $$(`a#archive${currentSeries.archive ? '' : '.hidden'}`, {href: currentSeries.archive}, currentSeries.archive?.getFilename() ?? '')
                                ));
                                body.append($$("main#preload.preload",
                                ));
                            },
                            update: e => {
                                // Series:
                                if (!that.series.length) return;
                                if (seriesIndex < 0) seriesIndex = that.series.length - 1;
                                if (seriesIndex >= that.series.length) seriesIndex = 0;
                                currentSeries = that.series[seriesIndex];
                                const archive = document.querySelector("#archive");
                                archive.classList[currentSeries.archive ? "remove" : "add"]("hidden");
                                archive.innerHTML = currentSeries.archive?.getFilename() ?? '';
                                document.querySelector("#series-name").innerHTML = currentSeries.name ?? '';

                                // Level:
                                if (!currentSeries.levels.length) return;
                                if (levelIndex < 0) levelIndex = currentSeries.levels.length - 1;
                                if (levelIndex >= currentSeries.levels.length) levelIndex = 0;
                                currentLevel = currentSeries.levels[levelIndex];
                                document.querySelector("#label").innerHTML = currentLevel.name;
                                
                                // Source:
                                if (!currentLevel.sources.length) return;
                                if (imgIndex >= currentLevel.sources.length) imgIndex = 0;
                                if (imgIndex < 0) imgIndex = currentLevel.sources.length - 1;

                                const img = new Image();
                                img.addEventListener("load", e => {
                                    requestAnimationFrame(() => {
                                        document.querySelector("#preload").style.backgroundImage = `url(${currentLevel.sources[imgIndex]})`;
                                        requestAnimationFrame(() => {
                                            body.style.backgroundImage = `url(${currentLevel.sources[imgIndex]})`;
                                        });
                                    });
                                });
                                img.src = currentLevel.sources[imgIndex];
                            },
                        };

                        that.loadSources({
                            resolve: () => {
                                loading.removeNode();
                                actions.start();
                                body.classList.remove("loading");
                            }
                        });

                        return this;
                    },
                },
                setters: {
                },
            },
            statics: {
                load:   function (data) {
                    privates.singleton = privates.singleton ?? new LevelViewer();
                    privates.singleton.load(data);
                    return privates.singleton;
                },
                render: function () {
                    LevelViewer
                    .load()
                    .render();
                },
            },
            verifiers: {
                series: aa.isArrayLike,
                title:  aa.isNullOrNonEmptyString,
            },
        };
        aa.manufacture(LevelViewer, blueprint, {cut, get, set});
        return LevelViewer;
    })();
    aa.events.app(ENV.APP_NAME).on({
        "bodyload": () => {
            LevelViewer.render();
        }
    });

    window.LevelViewer = LevelViewer;
})();
