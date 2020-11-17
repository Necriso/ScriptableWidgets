// Version 1.1.3
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date
// Usage:
// Add credentials toyour widget parameters: 
// API-Key|radius in km|fixedLocation (0 or 1) e.g my-api-key|1|0
// If you want to set a fixed location then the settings should look like:
// API-Key|radius in km|fixedLocation|latitude|longitude (0 or 1) e.g my-api-key|1|1|54.322|10.1355
// Important: Don't set the radius to big, the tankerkoenig.de endpoint will deliver all stations in the radius which is set,
// but only one is needed to display, so it will take a long time to fetch data.

let apiKey, radius, fixedLocation, latitude, longitude, myLocation
let widgetInput = args.widgetParameter;
if (widgetInput !== null) {
  [apiKey, radius, fixedLocation, latitude, longitude] = widgetInput.toString().split("|");

  if (!apiKey || !radius || !fixedLocation) {
    throw new Error("Invalid parameter. Expected format: apiKey|radius (1-20)|fixedLocation (0 or 1)")
  }
  if (fixedLocation === 1 && (!latitude || !longitude)) {
    throw new Error("If fixed location is set to 1 you must set latitude and longitude")
  }

  // Set strings to correct types
  radius = parseInt(radius)
  fixedLocation = parseInt(fixedLocation)

  if (fixedLocation == 0) {
    myLocation = {
      latitude: 0,
      longitude: 0
    }
  } else {
    myLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }
  }
} else {
  throw new Error("No Widget paramter set. Expected format: apiKey|radius (1-20)|fixedLocation (0 or 1)")
}

const backColor = Color.dynamic(new Color('FFFFFF'), new Color('111111'));
const backColor2 = Color.dynamic(new Color('EEEEEE'), new Color('222222'));
const textColor = Color.dynamic(new Color('000000'), new Color('EDEDED'));

const apiURL = (location, radius, apiKey) => `https://creativecommons.tankerkoenig.de/json/list.php?lat=${location.latitude.toFixed(3)}&lng=${location.longitude.toFixed(3)}&rad=${radius}&sort=dist&type=all&apikey=${apiKey}`

let station = await loadStation(apiKey, radius, fixedLocation, myLocation)
let widget = await createWidget(station)

if (!config.runsInWidget) {
  await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function loadStation(apiKey, radius, fixedLocation, myLocation) {
  let location

  if (fixedLocation) {
    location = myLocation
  } else {
    location = await Location.current()
  }

  const data = await new Request(apiURL(location, radius, apiKey)).loadJSON()

  if (data.stations.length === 0) {
    return { error: 1 }
  }
  return data
}

function formatValue(value) {
  let lastDigit = '⁹'
  let price = value.toString().slice(0, -1)
  return price + lastDigit + "€"
}

async function createWidget(data) {

  const list = new ListWidget()
  list.setPadding(0, 4, 1, 4)

  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    backColor,
    backColor2
  ]
  list.backgroundGradient = gradient

  if (data.error) {
    let errorMessage = list.addText('No station in selected radius found. Please set a greater radius in widget parameters')
    errorMessage.font = Font.boldSystemFont(12)
    errorMessage.textColor = textColor
    return list
  }

  const attr = data.stations[0]

  let open = '🔴'
  if (attr.isOpen) {
    open = '🟢'
  }

  let firstLineStack = list.addStack()

  let stationName = firstLineStack.addText(attr.brand)
  stationName.font = Font.boldSystemFont(15)
  stationName.textColor = textColor

  firstLineStack.addSpacer()
  let stationOpen = firstLineStack.addText(open)
  stationOpen.font = Font.mediumSystemFont(10)
  stationOpen.rightAlignText()

  list.addSpacer(5)

  let dieselStack = list.addStack()
  let dieselLabel = dieselStack.addText("Diesel:")
  dieselLabel.font = Font.boldSystemFont(12)
  dieselLabel.textColor = textColor

  dieselStack.addSpacer()
  let dieselPrice = dieselStack.addText(formatValue(attr.diesel))
  dieselPrice.font = new Font('Menlo', 12)
  dieselPrice.textColor = textColor

  list.addSpacer(1)

  let e5Stack = list.addStack()
  let e5Label = e5Stack.addText("Benzin E5:")
  e5Label.font = Font.boldSystemFont(12)
  e5Label.textColor = textColor

  e5Stack.addSpacer()
  let e5Price = e5Stack.addText(formatValue(attr.e5))
  e5Price.font = new Font('Menlo', 12)
  e5Price.textColor = textColor

  list.addSpacer(1)

  let e10Stack = list.addStack()
  let e10Label = e10Stack.addText("Benzin E10:")
  e10Label.font = Font.boldSystemFont(12)
  e10Label.textColor = textColor

  e10Stack.addSpacer()
  let e10Price = e10Stack.addText(formatValue(attr.e10))
  e10Price.font = new Font('Menlo', 12)
  e10Price.textColor = textColor

  list.addSpacer(5)
  let address = list.addText('Adresse:')
  address.font = Font.boldSystemFont(12)
  address.textColor = textColor

  let addressStack = list.addStack()

  let station = addressStack.addText(attr.street)
  station.font = Font.lightSystemFont(12)
  station.textColor = textColor

  let houseNumber = addressStack.addText(" " + attr.houseNumber)
  houseNumber.font = Font.lightSystemFont(12)
  houseNumber.textColor = textColor

  return list
}
