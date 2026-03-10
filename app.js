
const todayKey = new Date().toISOString().slice(0,10)
document.getElementById("today").innerText = todayKey

function saveSlot(btn){

let slot = btn.parentElement
let time = slot.dataset.time

let before = Number(slot.querySelector(".before").value)
let after = Number(slot.querySelector(".after").value)
let comment = slot.querySelector(".comment").value

let improvement = after - before

slot.querySelector(".improve").innerText = "Improvement: " + improvement

let data = JSON.parse(localStorage.getItem(todayKey) || "{}")

if(!data[time]) data[time] = {}

data[time].before = before
data[time].after = after
data[time].improvement = improvement
data[time].comment = comment

localStorage.setItem(todayKey, JSON.stringify(data))

}

function saveDaily(){

let data = JSON.parse(localStorage.getItem(todayKey) || "{}")

data.daily = {
units: document.getElementById("alcoholUnits").value,
drink: document.getElementById("drinkType").value,
impact: document.getElementById("breathingImpact").value,
exercise: document.getElementById("exercise").value
}

localStorage.setItem(todayKey, JSON.stringify(data))

}

function exportData(){

let all = {...localStorage}

let blob = new Blob([JSON.stringify(all,null,2)], {type:"application/json"})

let url = URL.createObjectURL(blob)

let a=document.createElement("a")
a.href=url
a.download="inhaler-data.json"
a.click()

}

function showTrends(){

let ctx = document.getElementById("trendChart")

let labels=[]
let values=[]

Object.keys(localStorage).forEach(date=>{

let day=JSON.parse(localStorage.getItem(date))

let total=0
let count=0

Object.keys(day).forEach(t=>{

if(day[t].improvement){
count++
total+=day[t].improvement
}

})

if(count>0){
labels.push(date)
values.push(Math.round(total/count))
}

})

new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Average Improvement',
data:values
}]
}
})

}

function showHome(){
location.reload()
}

if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js")
}
