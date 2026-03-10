
const todayKey = new Date().toISOString().slice(0,10)
document.getElementById("today").innerText = todayKey

function saveSlot(btn){
let slot = btn.parentElement
let time = slot.dataset.time
let score = slot.querySelector(".score").value
let comment = slot.querySelector(".comment").value

let data = JSON.parse(localStorage.getItem(todayKey) || "{}")
data[time] = {score,comment}

localStorage.setItem(todayKey,JSON.stringify(data))
alert("Saved")
}

function saveDaily(){

let data = JSON.parse(localStorage.getItem(todayKey) || "{}")

data.daily={
units:document.getElementById("alcoholUnits").value,
drink:document.getElementById("drinkType").value,
impact:document.getElementById("breathingImpact").value,
exercise:document.getElementById("exercise").value
}

localStorage.setItem(todayKey,JSON.stringify(data))

alert("Daily summary saved")
}

function exportData(){

let all = {...localStorage}
let blob = new Blob([JSON.stringify(all,null,2)],{type:"application/json"})
let url = URL.createObjectURL(blob)

let a=document.createElement("a")
a.href=url
a.download="inhaler-data.json"
a.click()

}
