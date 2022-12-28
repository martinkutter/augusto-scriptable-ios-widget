// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: cookie;

const version = 3;
const baseUrl = 'chemnitz.kitchen';
const refreshRate = 1000 * 60 * 60 // 1 hour

const widgetFamily = config.widgetFamily || 'large';

const useGrayScale = ['accessoryRectangular', 'accessoryCircular', 'accessoryInline'].includes(widgetFamily);
const color = {
    widget: {
        background: Color.dynamic(new Color('#fff'), new Color('#1c1c1e')),
    },
    update: {
        text: new Color('#fff'),
        background: useGrayScale ? new Color('#111') : new Color('#4caf50'),
    },
    date: {
        text: useGrayScale ? new Color('#fff') : Color.dynamic(new Color('#000', .7), new Color('#fff', .7)),
        background: useGrayScale ? new Color('#111') : Color.dynamic(new Color('#000', .08), new Color('#fff', .08)),
    },
    day: {
        text: Color.dynamic(new Color('#000', .7), new Color('#fff', .7)),
        background: Color.dynamic(new Color('#000', .08), new Color('#fff', .08)),
        textToday: Color.dynamic(new Color('#6f0409'), new Color('#fcc9cb')),
        backgroundToday: Color.dynamic(new Color('#df0913', .13), new Color('#f85e65', .25)),
    },
    entry: {
        text: Color.dynamic(new Color('#000'), new Color('#fff')),
    }
};

const availableStyle = {
    accessoryCircular: {
        widget: {
            padding: [0, 0, 0, 0],
        },
        header: false,
        update: false,
        message: false,
    },
    accessoryRectangular: {
        widget: {
            padding: [0, 0, 0, 0],
        },
        header: false,
        update: {
            padding: [1, 5, 1, 5],
            fontSize: 10,
            showAsBadge: true,
        },
        message: {
            padding: [3, 0, 3, 0],
            alignCenter: false,
        },
    },
    accessoryInline: {
        widget: {
            padding: [0, 0, 0, 0],
        },
        header: false,
        update: false,
        message: false,
    },
    small: {
        widget: {
            padding: [11, 15, 7, 15],
        },
        header: true,
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
            showAsBadge: false,
        },
        message: {
            padding: [0, 0, 0, 0],
            alignCenter: true,
        },
        logo: {
            size: new Size(60, 21),
        },
        date: {
            padding: [3, 8, 3, 8],
            cornerRadius: 20,
            fontSize: 11,
        },
        entry: {
            outerSpacing: 6,
        },
    },
    medium: {
        widget: {
            padding: [15, 15, 0, 15],
        },
        header: true,
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
            showAsBadge: false,
        },
        message: {
            padding: [15, 0, 25, 0],
            alignCenter: true,
        },
        logo: {
            size: new Size(80, 21),
        },
        date: {
            padding: [4, 8, 4, 8],
            cornerRadius: 20,
            fontSize: 12,
        },
        content: {
            padding: [8, 0, 0, 0],
        },
        day: {
            boxSize: 26,
            fontSize: 12,
            cornerRadius: 20,
        },
        entry: {
            padding: [3, 0, 0, 0],
            outerSpacing: 6,
            innerSpacing: 8,
        },
    },
    large: {
        widget: {
            padding: [15, 15, 0, 15],
        },
        header: true,
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
            showAsBadge: false,
        },
        message: {
            padding: [15, 0, 20, 0],
            alignCenter: true,
        },
        logo: {
            size: new Size(110, 29),
        },
        date: {
            padding: [6, 10, 6, 10],
            cornerRadius: 20,
            fontSize: 14,
        },
        content: {
            padding: [15, 0, 0, 0],
        },
        day: {
            boxSize: 30,
            fontSize: 14,
            cornerRadius: 20,
        },
        entry: {
            padding: [4, 0, 0, 0],
            outerSpacing: 7,
            innerSpacing: 10,
        },
    }
};

const style = availableStyle[widgetFamily];

if (config.runsInApp && !Keychain.contains('mail') && !Keychain.contains('password')) {
    const alert = new Alert();
    alert.title = "Anmelden";
    alert.message = `Bitte melde dich mit deinen ${baseUrl} Zugangsdaten an.`;
    alert.addTextField("E-Mail");
    alert.addSecureTextField("Password");
    alert.addAction("Anmelden");
    alert.addCancelAction("Abbrechen");

    const action = await alert.presentAlert();

    if (action === 0 && alert.textFieldValue(0) && alert.textFieldValue(1)) {
        Keychain.set('mail', alert.textFieldValue(0));
        Keychain.set('password', alert.textFieldValue(1));
    }
}

const widget = await createWidget();
if (!config.runsInWidget) {
    if (widgetFamily === 'accessoryCircular') {
        await widget.presentAccessoryCircular();
    } else if (widgetFamily === 'accessoryRectangular') {
        await widget.presentAccessoryRectangular();
    } else if (widgetFamily === 'accessoryInline') {
        await widget.presentAccessoryInline();
    } else if (widgetFamily === 'small') {
        await widget.presentSmall();
    } else if (widgetFamily === 'medium') {
        await widget.presentMedium();
    } else {
        await widget.presentLarge();
    }
}

Script.setWidget(widget);
Script.complete();

async function createWidget() {
    const widget = new ListWidget();

    widget.refreshAfterDate = new Date(Date.now() + refreshRate)
    const isUpdateAvailable = await checkForUpdate();

    const { stack, content, header } = widgetFamily === 'accessoryInline' ? {} : createLayout(widget, isUpdateAvailable);

    let data = (!Keychain.contains('mail') || !Keychain.contains('password')) ? 403 : await getData();

    if (data === 403) {
        Keychain.contains('mail') && Keychain.remove('mail');
        Keychain.contains('password') && Keychain.remove('password');

        createMessage(
            content,
            `Login fehlgeschlagen!`,
            `Bitte starte das "${module.filename.split('/').pop().replace('.js', '')}" Script in der Scriptable App und gib deine Zugangsdaten ein.`
        );

        return widget;
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const fromTimestamp = new Date().getHours() >= 14 ? new Date(today.setDate(today.getDate() + 1)) : today;

    if (data.length === 0) {
        createMessage(
            content,
            "Hungrig?",
            shouldShowNextWeek() ? "Nächste Woche kein Essen bestellt." : "Diese Woche kein Essen bestellt."
        );

        return widget;
    }

    if (['accessoryInline', 'accessoryCircular', 'accessoryRectangular'].includes(widgetFamily)) {
        const todayMeal = data.find(meal_ => meal_.isToday);

        if (todayMeal) {
            if (widgetFamily === 'accessoryCircular') {
                const headerLogo = content.addImage(getPizza());
                headerLogo.imageSize = new Size(58, 58);
                headerLogo.imageOpacity = 1;
            } else if (widgetFamily === 'accessoryInline') {
                const inline = widget.addStack();
                inline.addText(todayMeal.name);
            } else {
                createMessage(content, todayMeal.name);
            }
        }
        return widget;
    }

    const meal = data.find(meal_ => meal_.timestamp >= fromTimestamp);

    if (['small', 'medium'].includes(widgetFamily)) {
        if (!meal) {
            const day = new Date().getHours() >= 14 ? "Morgen" : "Heute";
            createMessage(content, "Hungrig?", day + " kein \nEssen bestellt.");

            return widget;
        }

        if (!meal.isToday) {
            createDate(header, meal.day);
        }
    }

    if (widgetFamily === 'small') {
        createMessage(content, meal.name);

        return widget;
    }

    if (widgetFamily === 'medium') {
        data = data.filter(entry => entry.timestamp === meal.timestamp).slice(0, 2);

        if (data.length === 1) {
            createMessage(content, meal.name);

            return widget;
        }
    }

    if (widgetFamily === 'large') {
        createDate(header, getDateRange());
    }

    content.setPadding(...style.content.padding);
    data.forEach(meal => createEntry(content, meal, widgetFamily === 'large'));
    stack.addSpacer();

    return widget;
}

function shouldShowNextWeek() {
    const today = new Date();
    return today.getDay() > 5 || (today.getDay() === 5 && today.getHours() >= 14);
}

function getDay(_day) {
    const today = new Date();
    const day = shouldShowNextWeek() ? _day + 7 : _day;
    const first = today.getDate() - today.getDay() + day;

    return new Date(today.setDate(first)).toLocaleDateString("de-DE");
}

function getMonday() {
    return getDay(1);
}

function getFriday() {
    return getDay(5);
}

function getDateRange() {
    const monday = getMonday().split('.');
    const friday = getFriday().split('.');

    return monday[0] + '.' + (monday[1] !== friday[1] ? (monday[1] + '.') : '') + ` - ${friday[0]}.${friday[1]}.`;
}

async function getData() {
    const url = `https://${baseUrl}/kunden/bestelluebersicht/?date_from=${getMonday()}&date_to=${getFriday()}`;
    const webview = new WebView();
    await webview.loadURL(url);

    const tryLogin = `
        (function (){  
            if (document.getElementById('login_submit')) {
                document.getElementById('email').value = "${Keychain.get('mail')}";
                document.getElementById('pass').value = "${Keychain.get('password')}";
                document.getElementById('login_submit').click();
                completion(false);
            } else {
                completion(true);
            }
         })();
    `;

    const isAlreadyLoggedIn = await webview.evaluateJavaScript(tryLogin, true);
    if (!isAlreadyLoggedIn) {
        await webview.waitForLoad();
        await webview.loadURL(url);
    }

    const extractData = `
        (function (){  
            if (document.getElementById('login_submit')) {
                completion(403);
            }

            const today = new Date().toDateString();
            const foodOrder = document.getElementsByClassName('food-order');

            if (foodOrder.length === 0) {
                completion(JSON.stringify([]));
            } else {
                completion(JSON.stringify(Array
                    .from(document
                        .getElementsByClassName('food-order')[0]
                        .getElementsByTagName('tbody')[0]
                        .getElementsByTagName('tr')
                    )
                    .map(row => {
                        const columns = Array.from(row.getElementsByTagName('td'));
                        const dayAndDate = columns[0].innerText.split(' ');
                        const date = dayAndDate[1].split('.');
                        const dateObject = new Date(parseInt(date[2]) + 2000, parseInt(date[1])-1, date[0]); 
                        return {
                            day: dayAndDate[0],
                            timestamp: dateObject.getTime(),
                            isToday: dateObject.toDateString() === today,
                            name: columns[2].innerText
                        };
                    })
                ));
            }
         })();
    `;

    return JSON.parse(await webview.evaluateJavaScript(extractData, true));
}

function createLayout(widget, isUpdateAvailable) {
    widget.backgroundColor = color.widget.background;
    widget.setPadding(0, 0, 0, 0);

    const widgetStack = widget.addStack();
    widgetStack.layoutVertically();

    isUpdateAvailable && createUpdateMessage(widgetStack);

    const stack = widgetStack.addStack();
    stack.setPadding(...style.widget.padding);
    stack.layoutVertically();

    const layoutStack = stack.addStack();
    layoutStack.topAlignContent();

    let headerStack = undefined;
    if (style.header) {
        layoutStack.layoutVertically();

        headerStack = layoutStack.addStack();
        const headerLogo = headerStack.addImage(getLogo());
        headerLogo.imageSize = style.logo.size;
        headerStack.addSpacer();
    }

    const contentStack = layoutStack.addStack();
    contentStack.layoutVertically();

    if (style.entry?.outerSpacing) {
        contentStack.spacing = style.entry.outerSpacing;
    }

    return {
        stack,
        content: contentStack,
        header: headerStack,
    };
}

function createUpdateMessage(widgetStack) {
    if (style.update) {
        const updateStack = widgetStack.addStack();
        updateStack.setPadding(...style.update.padding);
        updateStack.backgroundColor = color.update.background;

        if (style.update.showAsBadge) {
            updateStack.cornerRadius = 100;
        } else {
            updateStack.addSpacer();
        }

        const updateText = updateStack.addText("Update verfügbar");
        updateText.font = Font.mediumMonospacedSystemFont(style.update.fontSize);
        updateText.textColor = color.update.text;

        if (!style.update.showAsBadge) {
            updateStack.addSpacer();
        }
    }
}

function createMessage(content, _headline, _text) {
    if (style.message) {
        content.setPadding(...style.message.padding);
        style.message.alignCenter && content.centerAlignContent();
        style.message.alignCenter && content.addSpacer();
        content.spacing = 3;

        const headline = content.addText(_headline);
        headline.font = Font.semiboldSystemFont(24);
        headline.minimumScaleFactor = .5;

        if (_text) {
            const text = content.addText(_text);
            text.font = Font.regularSystemFont(14);
            text.minimumScaleFactor = .5;
        }

        style.message.alignCenter && content.addSpacer();
    }
}

function createEntry(content, meal, showDay) {
    const entryStack = content.addStack();
    entryStack.spacing = style.entry.innerSpacing;

    if (showDay) {
        const dayStack = entryStack.addStack();
        dayStack.backgroundColor = meal.isToday ? color.day.backgroundToday : color.day.background;
        dayStack.cornerRadius = style.day.cornerRadius;
        dayStack.centerAlignContent();
        dayStack.size = new Size(style.day.boxSize, style.day.boxSize);

        const day = dayStack.addText(meal.day);
        day.font = Font.boldSystemFont(style.day.fontSize);
        day.textColor = meal.isToday ? color.day.textToday : color.day.text;
    }

    const nameStack = entryStack.addStack();
    nameStack.setPadding(...style.entry.padding)

    const name = nameStack.addText(meal.name);
    name.font = Font.body();
    name.textColor = color.entry.text;
}

function createDate(header, text) {
    const dateStack = header.addStack();
    dateStack.setPadding(...style.date.padding);

    dateStack.backgroundColor = color.date.background;
    dateStack.cornerRadius = style.date.cornerRadius;

    const date = dateStack.addText(text);
    date.font = Font.boldSystemFont(style.date.fontSize);
    date.textColor = color.date.text;
}

async function checkForUpdate() {
    const request = new Request('https://raw.githubusercontent.com/martinkutter/augusto-scriptable-ios-widget/main/version.json');
    request.timeoutInterval = 5;

    const currentVersion = parseInt(await request.loadString());

    return request.response.statusCode === 200 && currentVersion !== version;
}

function getLogo() {
    return Image.fromData(Data.fromBase64String('iVBORw0KGgoAAAANSUhEUgAAAOwAAAA+CAYAAAAoJfcwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACd5JREFUeNrsXWlsVUUUnq5QpK2AUBYLpSwpSkVRWURTjXvUGElcoj+MGkyUSGJionELBoLoD2LAJQgJJi6IRECJCq6YaAQjKlQgbMoShFLLUpburefjnpfcPt6dudvre+++8yUnt+m7c+/MufPNmeXMGaUEAoFAIBAIBAKBQCDIDOTofjxYOGAwXe4luYaknKSX4XktJPtJviP5oLy1oTVoBikPT9DlUc0ts+g9v8SluZku8xzuryNZRmk+DSFvF9LlFpJbSSpJ+rpMCj1toDy8GPD9t9NlBn+bRFhJsoTec9yWZhJdHieZ4JBmCafpCpi3ErrcxroZQ1LkItkbJGvp3Y0e3zWFLotC5sZSysfigDoYQZenSapI+hv4Bn2fJtlBsp7kW3r/2fib8h1elEuX6SSzScaR5HrI5zSSB0lm0nMeo5f+GVBxw0iu0vxekuB//TRpDpIMCvghCuhyNcnrXF6vaCc5Dj2TfjoDZAWVoJpktMPvmxJ84xKuQE76+TKEhuxurjvIW56HpMjXNySNHl853lBH/OC3AOUHX2aSvOayobLjBpJHQFh6zjNUP3bZf3Qi4v38sks9ktWOiSRr6KX5UeqSUHnQSl5J8r5PssZ6NgUueiwZpxuSp+jPt0gu90hWoILkAh+vHpyE4lwWIC2s6kIfZI0B6dB7WkD6LNQSls34LJKRIRQaz5ofsWHEMO5BVAYciuBD9I6Ybmq4uz3MZ3pY2GIf6YYkoSwTfTZalWzsgiKfh6LzTBa22kV/2wumcxcyKhhAcm0IcwcFTNqoWFcQ7QUeQgXRrZ9ex8AkFKk3lcmPhazx0bNwAuZExtrzkevQFSgNseDFEbMkxZoxo9cWtDBCehnNxAlSWUd67RKzMShLUplKfRI2LOQxaXvrCFvmgmCY0epgMc0mFimHya0MRb6LbptdP4mkk3UfpTFsmcvymHRTRCT0QvrB3PA5Pc8EXV76+dBDHxf3dNrqgQ65zJ8Ce+VL1KrourCYeXyVZA8rf7iyZkurlQDYTfIKyR+G+7C0cziL9IIKimWbVSQndEbTRUW24wjPKTh1X783WGDd5NLfPsp5iea3YyQrSN6JNU7KWhac47Zn4sfyYRLpq9gaK7WGO+lylMmbk+VkPUmynnTzYRaW3UQyNGQfkW5+D/Ol9Lw2uvyj6TK3GdJv70EdYYlmNr3zqC1/4M1DylqRMcLPks0Ju0ME/e2mW5wtgF4asrTsx7j8Tigx9NyyAc12sjKwJn/G7QNyhWOCkIDufZPm96Ekk9k7TOATQlhBmITdQnJKc8/LJBPYE0gghBWkCuxiuVTpJ2qwvo9Jmb6iMSGsIPWoZcI6jWUxKYmNHJXs4ikQwgpSaGWb6bJcWUszToCT/iSxskJYQXrgMx7LtmjuuVMlx/9XCCsQeLSy6A6vMFhZ7FeuYf9jgRBWkGJgT+s2jZWF6yu8k8pFVd5wztOJHagLeFLA5P2EXQzxDtp5osru4EkVNw7+cDppJcvUHiEri835nytrT+wIh9vw2yi6b08YkUmyirBQnLJ8gUHECgMBr1fnbxgeJKpMqFvodYrhvjM85tsVsfIjTNDDJBc71Cc4UNxHsoNIuzdoSJpsI+yNJM+xck14VtTmCkWs1zcN9x0gmRtBwmIM+4OyNqU7NeiIF7aa722RKiNjWEHqusVwpHhXWUHFnLa5YTveVGU5VAiEsIIUo06Z3RVhZcdFLfaXEFaQiVYWlhWOFNg77bT9DpNSNykrPIxACCtIMWk30uVXZcXcdQLiF5eLu6IQVpAe+Jq7x064gseyJaIqd4RFmI3NJIigX6/00QO28X12OSmqPA8drFdYmJ1Zrgs4UmxV+plgBM8eSVZWao4Lwn7BCrtLWetnzZo0z/N9dkF0f1lH646zrNd7lPOxIdnSLYYuPlZ6d8Wxyoqa2EuqjjPyWaHNMZJSC2daD2uk+7uFQTHFzcnSSooGrJl0g9App0Qj6mcmLEiZyJECTjs4caKWvZ9EYzKGFaSwAUNEinXKCtjnBBC2SkUrLK4QVpCxgCMFNrnr/KYRNrePqCq6hE23MuRIXpyHU8qafNINEeB/HdXN7TkOS1euv1MUuh5VpAScp9mVBhUVO55KOMhYl03HqbIYqPjFlJ//kq0bl2uo0Ak8nxBI3CmqPs7mieo+WezcGki6qrd9C2w1LIkSYZsMv+OkPZzlaZ/4Gp1CguDc2Gm2/JQq/8dSBgUObb6D9RNrQKqSRAhYxv6GHg8q6HhDA4aT74oymJS6JVFsrsFqzI82/k1l3UWGsKbjEipIcJq6fSkqVRYN+pwcl58ClTzn9tgZLU7Alsk53AWNEdZTi+4BT3LjYCLbRUp/dlNhhg/VThgIi1CvsSnwPG488w3fuCuTCLvPxT0DezA/UGCrct6Ynu8xP7Hn+cFppXf5y2ULX9oDegFRh4RgvQ8pvR9AugN+09dpehh9PBiUWN1ot3/QdMeONPuAcAI4EPLz9vtMW8+SDjBF/ncLeNJlsufclhCf1cH1ozWTCAsL8lca5QeOEJtCelYbk7XWZ3o0HLtCIkpQNAToKcSA6BvYKHA8gwn7k/JwVo6Lur/TbrDSnrAc62ih0i+49yTgH7xGWV47QdwxO5msa+M9xzzmBTPkm1X3SbdUNaztAdOv47I0ZTBhsWy1mi1jEMDjEJOF7/E2xYyxsCDt+3RZxK3NWeXuoN5k5QXvR+iT+Wz5Gz1W1A5ugWEZ4V+7MkBeOjkvbytrk0HsBLlU+HUf9jF06eQ0h7gRfAl6yeT4Tnz8JVYuVnG5Wjx8jy5ueBvYUi+m522NnyBJ1M3aqpxn+xJNcuxV1uxforW4pjAIRhmfe7BwAM4WReAuxAjCTKefBfY6FfBISFhEyssy7so+oKxN2P14MiHHUDlB8H9JNpCsoGe1BMwL9Luc8oMzUqeTjOG89FX+JhWPBBgqbFfuYzO1sC7wLeBn/AmVpS4JHNquevgIUI4aOYP+hNQoa3M+vkeBoSFv5PE75m1WJjpL97zKRS+qUFZEOyfru5sedCouDSpJsabVqA0rjCcv0Ofw+0b5eARasCOUn/oQ8hLTYS7np0KjtzbbJFFnMqyITTeoHGXK34ztYfb79fpuOO8PV+7XUI+yLtpYH0khD+WrWkeUsA+YTvB+1AcsYw1V+uU09Nz2xXpIEkVSIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIegbdHCd4kTdPpV9oEYEgmwEninY4U8S7rsGlDVHYS0VHAkHaALuXzh13Ek9YBHNeoKxIBQKBID2AXTvwWT8tYU4FggxCvIWFg36jyuwNxAJB1ABOdiYiLHZPYPPtRtGRQJA2QLAEOe5FIBAIBIKk4X8BBgCI7qiW5eyOBgAAAABJRU5ErkJggg=='));
}

function getPizza() {
    return Image.fromData(Data.fromBase64String('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'));
}
