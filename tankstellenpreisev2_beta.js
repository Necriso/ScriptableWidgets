// Version 2.0.0
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date

const files = FileManager.local()
const configPath = files.joinPath(files.documentsDirectory(), "widget-tankstelle.json")
const configExits = files.fileExists(configPath)

let configuration = await loadConfig()

if (!configuration) {
    console.log("noconfig")
    configuration =  {
        apiKey: '',
        radius: '',
        fixedLocation: '',
        myLocation: {
            latitude: '',
            longitude: ''
        }
    }
}

console.log(configuration)

if (config.runsInApp) {
    const alert = await createAlert(configuration)
    const response = await alert.present()

    if (response === 0) {
        console.log('Cancel was pressed... doing nothing')
      } else if (response === 1) {
        console.log('Submit was pressed')    

        let store = {    
            apiKey: alert.textFieldValue(0),
            radius: alert.textFieldValue(1),
            fixedLocation: parseInt(alert.textFieldValue(2)),
            myLocation: {
                latitude: parseFloat(alert.textFieldValue(3)),
                longitude: parseFloat(alert.textFieldValue(4))
            }
        }
        await storeConfig(store)
      }
}

const apiURL = (location, radius, apiKey) => `https://creativecommons.tankerkoenig.de/json/list.php?lat=${location.latitude.toFixed(3)}&lng=${location.longitude.toFixed(3)}&rad=${radius}&sort=dist&type=all&apikey=${apiKey}`

let station = await loadStation()
let widget = await createWidget(station)

if (!config.runsInWidget) {
    await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()


async function createAlert(configuration) {
    console.log('Creating alert with data')
  
    const alert = new Alert()
    alert.title = `Settings`  

    if (!configuration.fixedLocation) {
        configuration.fixedLocation = "0"
    }

    if (!configuration.myLocation.latitude) {
        configuration.myLocation.latitude = ''
    }

    if (!configuration.myLocation.longitude) {
        configuration.myLocation.longitude = ''
    }

    alert.addTextField('API-Key', configuration.apiKey || '')
    alert.addTextField('Radius in km (e.g 1)', configuration.radius.toString())
    alert.addTextField('Fixed Location (0 or 1)', configuration.fixedLocation.toString())
    alert.addTextField('Fixed Latitude (e.g. 53.511)', configuration.myLocation.latitude.toString())
    alert.addTextField('Fixed Longitude (e.g. 9.9937)', configuration.myLocation.longitude.toString())  
    alert.addAction('Cancel'); // 0
    alert.addAction('Submit'); // 1
  
    return alert;
  }

async function storeConfig(data)
{
    try {
        files.writeString(configPath, JSON.stringify(data))
      } catch (e) {
        console.log("Creating Config failed!")
        console.log(e)
      }
}

async function loadConfig() {    
    let data

    if (configExits) {
        console.log("Get from file")
        data = JSON.parse(files.readString(configPath))        
    } else {
        data = null
    }
    return data
}

async function loadStation() {
    let location

let config = await loadConfig()

    if (config.fixedLocation === 1) {
        location = config.myLocation
    } else {
        location = await Location.current()    
    }
    console.log(location)
    const data = await new Request(apiURL(location, config.radius, config.apiKey)).loadJSON()
    
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
