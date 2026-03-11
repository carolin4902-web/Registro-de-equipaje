const express = require("express")
const path = require("path")
const fs = require("fs")

const app = express()
const port = 3000

app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname))

// PAGINA PRINCIPAL
app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"index.html"))
})

// FUNCIÓN DE ERROR
function mostrarError(res, mensaje){

return res.send(`

<!DOCTYPE html>
<html>

<head>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
}

.card{
background:#1e293b;
border:none;
border-radius:10px;
}

.card-header{
background:#dc2626;
font-size:22px;
font-weight:bold;
}

</style>

</head>

<body class="p-5">

<div class="container">

<div class="card shadow">

<div class="card-header">
⚠️ Error en el registro
</div>

<div class="card-body">

<p>${mensaje}</p>

<a href="/" class="btn btn-primary">
Volver al formulario
</a>

</div>

</div>

</div>

</body>

</html>

`)
}

// REGISTRO
app.post("/submit",(req,res)=>{

const {
nombre,
idPasajero,
destino,
aerolinea,
vuelo,
cantidadMaletas,
pesos
} = req.body

const cantidadMaletasNum = parseInt(cantidadMaletas)

// validar campos
if(!nombre || !idPasajero || !destino || !aerolinea || !vuelo || !cantidadMaletas || !pesos){
return mostrarError(res,"Todos los campos son obligatorios")
}

// máximo maletas
if(cantidadMaletasNum > 5){
return mostrarError(res,"Máximo 5 maletas por pasajero")
}

// convertir pesos
const listaPesos = pesos.split(",").map(p => parseFloat(p.trim()))

// validar negativos
if(listaPesos.some(p => p < 0)){
return mostrarError(res,"Los pesos no pueden ser negativos")
}

// validar coincidencia
if(listaPesos.length != cantidadMaletasNum){
return mostrarError(res,"Cantidad de pesos y maletas no coincide")
}

// validar peso máximo
if(listaPesos.some(p => p > 32)){
return mostrarError(res,"Ninguna maleta puede superar 32kg")
}

// calcular peso total
const pesoTotal = listaPesos.reduce((a,b)=>a + b,0)

// franquicia
const FRANQUICIA = 15
const TARIFA = 8000
let exceso = 0
let costo = 0

if(pesoTotal > FRANQUICIA){
exceso = pesoTotal - FRANQUICIA
costo = exceso * TARIFA
}

// costo vuelo
const costoBase = 500000
const totalVuelo = costoBase + costo

// leer datos existentes
let datos = []

if(fs.existsSync("datos.json")){

const contenido = fs.readFileSync("datos.json","utf8")
datos = JSON.parse(contenido)

}

// crear registro
const registro = {

nombre,
idPasajero,
destino,
aerolinea,
vuelo,
cantidadMaletas:cantidadMaletasNum,
pesoTotal,
exceso,
costo,
totalVuelo

}


// guardar registro
datos.push(registro)

fs.writeFileSync("datos.json", JSON.stringify(datos,null,2))



// construir tabla
let filas = ""

datos.forEach(p=>{

filas += `

<tr>

<td>${p.nombre}</td>
<td>${p.idPasajero}</td>
<td>${p.destino}</td>
<td>${p.aerolinea}</td>
<td>${p.vuelo}</td>
<td>${p.cantidadMaletas}</td>
<td>${p.pesoTotal} kg</td>
<td>${p.exceso} kg</td>
<td>$${p.costo}</td>
<td>$${p.totalVuelo}</td>

</tr>

`

})

// Pinta
res.send(`

<!DOCTYPE html>
<html>

<head>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
}

table{
background:#1e293b;
}

th{
background:#2563eb;
}

</style>

</head>

<body class="p-5">

<h1>Registro de Equipaje</h1>

<table class="table table-bordered text-white">

<tr>

<th>Nombre</th>
<th>ID</th>
<th>Destino</th>
<th>Aerolínea</th>
<th>Vuelo</th>
<th>Maletas</th>
<th>Peso Total</th>
<th>Exceso</th>
<th>Costo</th>
<th>Total</th>

</tr>

${filas}

</table>

<br>

<a href="/" class="btn btn-primary">
Registrar otro pasajero
</a>

</body>

</html>

`)

})

app.listen(port,()=>{
console.log("Servidor corriendo en http://localhost:3000")
})