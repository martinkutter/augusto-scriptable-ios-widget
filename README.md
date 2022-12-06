# Augusto Scriptable iOS Widget
[Scriptable](https://scriptable.app) Script, um bestellte Gerichte von [chemnitz.kitchen](https://chemnitz.kitchen) als iOS-Widgets anzuzeigen.

## Installation
1. [Scriptable App](https://apps.apple.com/de/app/scriptable/id1405459188) aus dem App Store laden
2. Scriptable App öffnen und mit (+) neues Script erstellen
3. Inhalt der [Augusto.js](https://raw.githubusercontent.com/martinkutter/augusto-scriptable-ios-widget/main/Augusto.js) kopieren und einfügen
4. Links unten auf die Einstellungen (Schieberegler) tippen
5. Name "Augusto" eingeben und schließen
6. Script mit Play ausführen
7. Zugangsdaten eingeben
8. Widget zum Home- oder Lockscreen hinzufügen, siehe unten

## Homescreen Widgets
![Ansicht der verschiedenen Anzeigevarianten der iOS-Homescreen Widgets](doc/visual-homescreen.png?raw=true)

### Hinzufügen
1. Zum iOS Homescreen wischen, auf dem das Widget platziert werden soll
2. Hintergrund tippen und gedrückt halten 
3. Auf (+) oben links tippen und nach "Scriptable" suchen \
    <em>Es kann sein, dass Scriptable hier kurz nach der Installation noch nicht auftaucht. \
    👽 Neustarten des iPhones hilft dann weiter.</em>
4. Widget in gewünschter Größe auswählen und hinzufügen, mit "Fertig" bestätigen 
5. Lange auf das Widget tippen und "Widget bearbeiten" wählen
6. "Augusto" als Script und "Run Script" als When Interacting auswählen 
7. Fertig

### Small Widget
<img alt="Ansicht eines kleinen Widgets" src="doc/small.png?raw=true" width="88"/>

Stellt bis 14 Uhr das erste Gericht des aktuellen Tages dar, danach das Gericht des nächsten Tages, für den bestellt wurde.
Wird nicht das Essen vom aktuellen Tag angezeigt, befindet sich rechts oben der Wochentag, auf den sich die Bestellung bezieht.

### Medium Widget
<img alt="Ansicht eines kleinen Widgets" src="doc/medium.png?raw=true" width="188"/>

Ideal für alle, die mehrere Gerichte pro Tag bestellt haben, z.B. Desserts.  
Stellt bis 14 Uhr bis zu zwei Gerichte des aktuellen Tages dar, danach die Gerichte des nächsten Tages, für den bestellt wurde.
Werden nicht die Gerichte vom aktuellen Tag angezeigt, befindet sich rechts oben der Wochentag, auf den sich die Bestellung bezieht.

### Large Widget
<img alt="Ansicht eines kleinen Widgets" src="doc/large.png?raw=true" width="188"/>

Stellt die bestellten Gerichte der aktuellen Woche dar.  
Ab Freitag 14 Uhr werden die bestellten Gerichte der Folgewoche angezeigt.

## Lockscreen Widgets
![Ansicht der verschiedenen Anzeigevarianten der iOS-Lockscreen Widgets](doc/visual-lockscreen.png?raw=true)

### Hinzufügen
1. Lockscreen tippen und gedrückt halten
2. "Anpassen" auswählen
3. Sperrbildschirm auswählen
4. Bereich über/unter der Uhrzeit antippen
5. "Scriptable" aus der Liste auswählen \
   <em>Es kann sein, dass Scriptable hier kurz nach der Installation noch nicht auftaucht. \
   👽 Neustarten des iPhones hilft dann weiter.</em>
6. Widget in gewünschter Größe auswählen und hinzufügen 
7. auf das Widget tippen
8. "Augusto" als Script und "Run Script" als When Interacting auswählen 
9. Fertig

### Inline Widget
<img alt="Ansicht des Inline Widgets" src="doc/inline.png?raw=true" width="278"/>

Stellt das Gericht des aktuellen Tages dar, wenn am aktuellen Tag nichts bestellt wurde, bleibt das Widget leer.

### Rectangular Widget
<img alt="Ansicht des eckigen Widgets" src="doc/rectangular.png?raw=true" width="155"/>

Stellt das Gericht des aktuellen Tages dar, wenn am aktuellen Tag nichts bestellt wurde, bleibt das Widget leer.

### Circular Widget
<img alt="Ansicht des runden Widgets" src="doc/circular.png?raw=true" width="88"/>

Wenn am aktuellen Tag ein Gericht bestellt wurde, wird das Augusto Pizza Logo angezeigt.

## Update Hinweis
Steht eine neue Version des Widgets zur Verfügung, wird im Widget automatisch ein Hinweis angezeigt.  
Dann bitte Schritt 3 der Installation wiederholen. (Es kann bis zu einer Stunde dauern, bis das Widget die neue Version nutzt.)

### Author
Martin Kutter

### Licence / Copyright
Sourcecode: MIT  
Screenshots: Alle Rechte vorbehalten.  
Logo: Alle Rechte vorbehalten. Copyright Augusto UG (haftungsbeschränkt)
