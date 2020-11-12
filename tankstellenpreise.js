// Version 1.0.3
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date

let apiKey = 'YOUR-API-KEY' // get API-Key from https://creativecommons.tankerkoenig.de/
let radius = 1 // radius in km, set it higher if the script throws an error, it's possible that there is no gas station near your location

const apiURL = (location, radius, apiKey) => `https://creativecommons.tankerkoenig.de/json/list.php?lat=${location.latitude.toFixed(3)}&lng=${location.longitude.toFixed(3)}&rad=${radius}&sort=dist&type=all&apikey=${apiKey}`

let station = await loadStation(apiKey, radius)
let widget = await createWidget(station)
if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

async function loadStation(apiKey, radius) {
    let location = await Location.current()    

    const data = await new Request(apiURL(location, radius, apiKey)).loadJSON()
    
    if (!data) {
        const errorList = new ListWidget()
        errorList.addText("Keine Ergebnisse für den aktuellen Ort gefunden.")
        return errorList
    }
    return data
}

async function createWidget(data) {
    const attr = data.stations[0]
    
    const list = new ListWidget()
    list.setPadding(0, 4, 1, 4)
    
    const gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
        new Color("111111"),
        new Color("222222")
    ]
    list.backgroundGradient = gradient    

    let open = '🔴'
    if (attr.isOpen) {
      open = '🟢'
    }

    let firstLineStack = list.addStack()

    let stationName = firstLineStack.addText(attr.brand)
    stationName.font = Font.boldSystemFont(15)
    stationName.textColor = Color.white()
  
    firstLineStack.addSpacer()
    let stationOpen = firstLineStack.addText(open)
    stationOpen.font = Font.mediumSystemFont(10)
    stationOpen.rightAlignText()

    list.addSpacer(5)

    let dieselStack = list.addStack()    
    let dieselLabel = dieselStack.addText("Diesel:")
    dieselLabel.font = Font.boldSystemFont(12)
    
    dieselStack.addSpacer()    
    let dieselPrice = dieselStack.addText(attr.diesel + "€")
    dieselPrice.font = Font.mediumSystemFont(12)

    list.addSpacer(1)

    let e5Stack = list.addStack()
    let e5Label = e5Stack.addText("Benzin E5:")
    e5Label.font = Font.boldSystemFont(12)
    
    e5Stack.addSpacer()
    let e5Price = e5Stack.addText(attr.e5 + "€")
    e5Price.font = Font.mediumSystemFont(12)

    list.addSpacer(1)

    let e10Stack = list.addStack()
    let e10Label = e10Stack.addText("Benzin E10:")
    e10Label.font = Font.boldSystemFont(12)
    
    e10Stack.addSpacer()
    let e10Price = e10Stack.addText(attr.e10 + "€")
    e10Price.font = Font.mediumSystemFont(12)
    
    list.addSpacer(5)
    let address = list.addText('Adresse:')
    address.font = Font.boldSystemFont(12)
    let station = list.addText(attr.street)
    station.font = Font.lightSystemFont(12)
    
    return list
}
