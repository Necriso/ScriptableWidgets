let schema = 'http'
let openWebIfUser = 'root'
let openWebIfPassword = 'password'
let openWebIfUrl = '192.168.178.33/api'

let currentChannel = await loadCurrentChannel()
console.log(currentChannel)
let widget = await createWidget(currentChannel)
Script.setWidget(widget)
Script.complete()


async function loadCurrentChannel() {
    let url = schema + "://" + openWebIfUser + ":" + openWebIfPassword + "@" + openWebIfUrl + "/getcurrent"
    let req = new Request(url)
    req.allowInsecureRequest = true
    try {
      let json = await req.loadJSON()
      console.log(json)
      return json
    } catch(e) {
        return 'Keine Verbindung zum Server'
      //throw new Error('Keine Verbindung zum Server')
    }
}

function getTime(timestamp) {
    let ts = new Date(timestamp * 1000)
    return ts.toLocaleTimeString("de-DE", {timeZone: 'Europe/Berlin', hour: '2-digit', minute:'2-digit'})
}

async function createWidget(channel) {
    let widget = new ListWidget()
    widget.setPadding(5, 0, 0, 5)
  // set gradient background
  let startColor = new Color("#000")
  let endColor = new Color("#111")
  let gradient = new LinearGradient()
  gradient.colors = [startColor, endColor]
  gradient.locations = [0, 1]
  widget.backgroundColor = new Color("#000")
  widget.backgroundGradient = gradient

    if (typeof channel !== "object") {
        let nowText = widget.addText(channel)
        nowText.font = Font.boldSystemFont(12)
        nowText.textColor = Color.white()
        nowText.centerAlignText()
        nowText.textOpacity = 0.8
    } else {  
        let nowChannelText = widget.addText(channel.now.sname)
        nowChannelText.font = Font.boldSystemFont(12)
        nowChannelText.textColor = Color.white()
        nowChannelText.centerAlignText()
        nowChannelText.textOpacity = 0.8

        widget.addSpacer(5)

        let nowText = widget.addText("JETZT")
        nowText.font = Font.boldSystemFont(12)
        nowText.textColor = Color.white()
        nowText.centerAlignText()
        nowText.textOpacity = 0.8
        
        let nowTimeTxt = widget.addText(getTime(channel.now.begin_timestamp) + " Uhr")
        nowTimeTxt.font = Font.semiboldSystemFont(12)
        nowTimeTxt.textColor = Color.white()
        nowTimeTxt.centerAlignText()

        let nowTitleTxt = widget.addText(channel.now.title)
        nowTitleTxt.font = Font.semiboldSystemFont(12)
        nowTitleTxt.textColor = Color.white()
        nowTitleTxt.centerAlignText()

        widget.addSpacer(5)

        let nextText = widget.addText("NÄCHSTE")
        nextText.font = Font.boldSystemFont(12)
        nextText.textColor = Color.white()
        nextText.centerAlignText()
        nextText.textOpacity = 0.8
        
        let nextTimeTxt = widget.addText(getTime(channel.next.begin_timestamp) + " Uhr")
        nextTimeTxt.font = Font.semiboldSystemFont(12)
        nextTimeTxt.textColor = Color.white()
        nextTimeTxt.centerAlignText()      

        let nextTitleTxt = widget.addText(channel.next.title)
        nextTitleTxt.font = Font.semiboldSystemFont(12)
        nextTitleTxt.textColor = Color.white()
        nextTitleTxt.centerAlignText()
        
        widget.addSpacer()
    }
    return widget
}
