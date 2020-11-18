// Version 1.0.0
// Check www.scriptables.net for more widgets
// Use www.scriptdu.de to keep the widget up-to-date
// Usage:
// Add credentials toyour widget parameters: 
// fuelType (DIE, SUP, GAS)


let fuelType
let widgetInput = args.widgetParameter;

if (widgetInput !== null) {
    fuelType = widgetInput.toString();

    if (!fuelType) {
        throw new Error("Invalid parameter. Expected format: fuelType (DIE, SUP, GAS)")
    }

} else {
    throw new Error("No Widget paramter set. Expected format: fuelType (DIE, SUP, GAS)")
}

const backColor = Color.dynamic(new Color('FFFFFF'), new Color('111111'));
const backColor2 = Color.dynamic(new Color('EEEEEE'), new Color('222222'));
const textColor = Color.dynamic(new Color('000000'), new Color('EDEDED'));
const greyTextColor = Color.dynamic(new Color('000000'), new Color('BBBBBB'))
const apiURL = (location, fuelType) => `https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=${location.latitude.toFixed(3)}&longitude=${location.longitude.toFixed(3)}&fuelType=${fuelType.toUpperCase()}&includeClosed=false`

let station = await loadStation(fuelType)
let widget = await createWidget(station, fuelType)

if (!config.runsInWidget) {
    await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

async function loadStation(fuelType) {
    let location = await Location.current()
    
    const data = await new Request(apiURL(location, fuelType)).loadJSON()

    if (data.length === 0) {
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
        let errorMessage = list.addText('No stations found.')
        errorMessage.font = Font.boldSystemFont(12)
        errorMessage.textColor = textColor
    }
    return list
}

async function createWidget(data, fuelType) {
    let list = createList(data);
    const stations = data;
    const attr = stations.filter(stations => stations.prices.length !== 0);

    attr.sort(function (a, b) {
        return a['prices'][0]['amount'] > b['prices'][0]['amount'];
    });

    for (let i = 0; i < 3; i++) {
        if (attr[i]) {
            if (i === 0) {
                let stationPrice = list.addText(formatValue(attr[i]['prices'][0]['amount']))
                stationPrice.font = new Font('Menlo', 25)
                stationPrice.centerAlignText()
                stationPrice.textColor = textColor

                let stationName = list.addText(attr[i]['name'])
                stationName.font = Font.boldSystemFont(12)
                stationName.textColor = textColor
                stationName.centerAlignText()

                let station = list.addText(attr[i].location.address)
                station.font = Font.lightSystemFont(12)
                station.centerAlignText()
                station.textColor = textColor

                list.addSpacer(7)
            } else if (i === 1) {
                let stationStack1 = list.addStack()
                let price1 = stationStack1.addText(formatValue(attr[i]['prices'][0]['amount']))
                price1.font = new Font('Menlo', 10)
                price1.textColor = greyTextColor

                stationStack1.addSpacer(3)
                let addressStack1 = stationStack1.addStack()
                addressStack1.layoutVertically()

                let station1 = addressStack1.addText(attr[i]['name'])
                station1.font = Font.regularSystemFont(10)
                station1.textColor = greyTextColor

                let address1 = addressStack1.addText(attr[i].location.address)
                address1.font = Font.regularSystemFont(10)
                address1.textColor = greyTextColor

                list.addSpacer(2)
            } else if (i === 2) {
                let stationStack2 = list.addStack()
                let price2 = stationStack2.addText(formatValue(attr[i]['prices'][0]['amount']))
                price2.font = new Font('Menlo', 10)
                price2.textColor = greyTextColor

                stationStack2.addSpacer(3)

                let addressStack2 = stationStack2.addStack()
                addressStack2.layoutVertically()

                let station2 = addressStack2.addText(attr[i]['name'])
                station2.font = Font.regularSystemFont(10)
                station2.textColor = greyTextColor

                let address2 = addressStack2.addText(attr[i].location.address)
                address2.font = Font.regularSystemFont(10)
                address2.textColor = greyTextColor
            }
        }
    }

    return list
}
