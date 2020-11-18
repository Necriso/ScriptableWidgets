// Version 1.0.0
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date
// Usage:
// Add credentials toyour widget parameters: 
// API-Key|radius in km|oilType (diesel, e5, e10)
// Important: Don't set the radius to big, the tankerkoenig.de endpoint will deliver all stations in the radius which is set,
// so it will take a long time to fetch data.

let apiKey, radius, fixedLocation, latitude, longitude, myLocation, oilType
let widgetInput = args.widgetParameter;

if (widgetInput !== null) {
    [apiKey, radius, oilType] = widgetInput.toString().split("|");

    if (!apiKey || !radius || !oilType) {
        throw new Error("Invalid parameter. Expected format: apiKey|radius (1-20)|oilType (diesel, e5, e10)")
    }
    // Set strings to correct types
    radius = parseInt(radius)

} else {
    throw new Error("No Widget paramter set. Expected format: apiKey|radius (1-20)|fixedLocation (0 or 1)")
}

const backColor = Color.dynamic(new Color('FFFFFF'), new Color('111111'));
const backColor2 = Color.dynamic(new Color('EEEEEE'), new Color('222222'));
const textColor = Color.dynamic(new Color('000000'), new Color('EDEDED'));
const greyTextColor = Color.dynamic(new Color('000000'), new Color('BBBBBB'))

const apiURL = (location, radius, apiKey) => `https://creativecommons.tankerkoenig.de/json/list.php?lat=${location.latitude.toFixed(3)}&lng=${location.longitude.toFixed(3)}&rad=${radius}&sort=dist&type=all&apikey=${apiKey}`

let station = await loadStation(apiKey, radius)
let widget = await createWidget(station, oilType)

if (!config.runsInWidget) {
    await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function loadStation(apiKey, radius) {
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

function createList(data) {
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
    }
    return list
}

async function createWidget(data, oilType) {
    let list = createList(data);
    const stations = data.stations;
    const attr = stations.filter(stations => stations[oilType] !== null && stations.isOpen === true);

    attr.sort(function (a, b) {
        return a[oilType] > b[oilType];
    });

    for (let i = 0; i < 3; i++) {
        if (attr[i]) {
            if (i === 0) {
                let stationPrice = list.addText(formatValue(attr[i][oilType]))
                stationPrice.font = new Font('Menlo', 25)
                stationPrice.centerAlignText()
                stationPrice.textColor = textColor

                let stationName = list.addText(attr[i]['brand'])
                stationName.font = Font.boldSystemFont(12)
                stationName.textColor = textColor
                stationName.centerAlignText()

                let station = list.addText(attr[i].street + " " + attr[i].houseNumber)
                station.font = Font.lightSystemFont(12)
                station.centerAlignText()
                station.textColor = textColor

                list.addSpacer(7)
            } else if (i === 1) {
                let stationStack1 = list.addStack()
                let price1 = stationStack1.addText(formatValue(attr[i][oilType]))
                price1.font = new Font('Menlo', 10)
                price1.textColor = greyTextColor

                stationStack1.addSpacer(3)
                let addressStack1 = stationStack1.addStack()
                addressStack1.layoutVertically()

                let station1 = addressStack1.addText(attr[i]['brand'])
                station1.font = Font.regularSystemFont(10)
                station1.textColor = greyTextColor

                let address1 = addressStack1.addText(attr[i].street + " " + attr[i].houseNumber)
                address1.font = Font.regularSystemFont(10)
                address1.textColor = greyTextColor

                list.addSpacer(2)
            } else if (i === 2) {
                let stationStack2 = list.addStack()
                let price2 = stationStack2.addText(formatValue(attr[i][oilType]))
                price2.font = new Font('Menlo', 10)
                price2.textColor = greyTextColor

                stationStack2.addSpacer(3)

                let addressStack2 = stationStack2.addStack()
                addressStack2.layoutVertically()

                let station2 = addressStack2.addText(attr[i]['brand'])
                station2.font = Font.regularSystemFont(10)
                station2.textColor = greyTextColor

                let address2 = addressStack2.addText(attr[i].street + " " + attr[i].houseNumber)
                address2.font = Font.regularSystemFont(10)
                address2.textColor = greyTextColor
            }
        }
    }

    return list
}
