// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: cookie;

const baseUrl = 'chemnitz.kitchen';

const widgetFamily = config.widgetFamily || 'medium';

const color = {
    widget: {
        background: Color.dynamic(new Color('#fff'), new Color('#1c1c1e')),
    },
    update: {
        text: new Color('#fff'),
        background: new Color('#4caf50'),
    },
    date: {
        text: Color.dynamic(new Color('#000', .7), new Color('#fff', .7)),
        background: Color.dynamic(new Color('#000', .08), new Color('#fff', .08)),
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
    small: {
        widget: {
            padding: [11, 15, 7, 15],
        },
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
        },
        message: {
            padding: [0, 0, 0, 0],
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
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
        },
        message: {
            padding: [15, 0, 25, 0],
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
        update: {
            padding: [5, 5, 5, 5],
            fontSize: 10,
        },
        message: {
            padding: [15, 0, 20, 0],
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
            outerSpacing: 8,
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
    if (widgetFamily === 'small') {
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
    const { stack, content, header } = createLayout(widget);
    
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
    
    const meal = data.find(meal_ => meal_.timestamp >= fromTimestamp);
    if (['small', 'medium'].includes(widgetFamily)) {
        if (!meal) {
            createMessage(content, "Hungrig?", "Heute kein \nEssen bestellt.");

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
    return today.getDay() > 5;
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
                return JSON.stringify([]);
            }

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
    layoutStack.layoutVertically();

    const headerStack = layoutStack.addStack();
    const headerLogo = headerStack.addImage(getLogo());
    headerLogo.imageSize = style.logo.size;
    headerStack.addSpacer();
    
    const contentStack = layoutStack.addStack();
    contentStack.layoutVertically();
    contentStack.spacing = style.entry.outerSpacing;
    
    return {
        stack,
        content: contentStack,
        header: headerStack,
    };
}

function createUpdateMessage(widgetStack) {
    const updateStack = widgetStack.addStack();
    updateStack.setPadding(...style.update.padding);
    updateStack.backgroundColor = color.update.background;
    updateStack.addSpacer();
    
    const updateText = updateStack.addText("Update verfügbar");
    updateText.font = Font.mediumMonospacedSystemFont(style.update.fontSize);
    updateText.textColor = color.update.text;
    
    updateStack.addSpacer();
}

function createMessage(content, _headline, _text) {
    content.setPadding(...style.message.padding);
    content.centerAlignContent();
    content.addSpacer();
    content.spacing = 3;
        
    const headline = content.addText(_headline);
    headline.font = Font.semiboldSystemFont(24);
    headline.minimumScaleFactor = .5;

    if (_text) {
        const text = content.addText(_text);
        text.font = Font.regularSystemFont(14);
        text.minimumScaleFactor = .5;
    }

    content.addSpacer();
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

function getLogo() {
    return Image.fromData(Data.fromBase64String('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'));
}