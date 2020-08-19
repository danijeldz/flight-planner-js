const options = {
	enableHighAccuracy: true,
	timeout: 10000,
	maximumAge: 0,
}

const success = (pos) => {
	// Initialize map with user coords as center
	const mapDiv = document.getElementById("map")
	const mapOptions = {
		center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
	}
	const map = new google.maps.Map(mapDiv, mapOptions)

	// Create flight plan as polyline
	let path = new google.maps.MVCArray()
	let polylineOptions = {
		path: path,
		strokeColor: "#ff0000",
		strokeWeight: 3,
	}

	const polyline = new google.maps.Polyline(polylineOptions)

	polyline.setMap(map)

	const btnSaveFlight = document.querySelector("#saveNewFlight")
	google.maps.event.addListener(map, "click", (e) => {
		let currentPath = polyline.getPath()
		currentPath.push(e.latLng)
		resetBtn.classList.remove("disabled")
		btnSaveFlight.classList.remove("disabled")
		deactivatePlans()
	})

	// Create array of flight plans
	const form = document.querySelector("#addNewFlightPlan")
	let flightPlans = []
	form.addEventListener("submit", (e) => {
		e.preventDefault()

		let flightPlanCoords = []

		let currentPath = polyline.getPath()
		for (let i = 0; i < currentPath.getLength(); i++) {
			const xy = currentPath.getAt(i)
			flightPlanCoords.push({ lat: xy.lat(), lng: xy.lng() })
		}

		let flightPlan = {
			title: form.title.value,
			coords: flightPlanCoords,
		}

		flightPlans.push(flightPlan)
		localStorage.setItem("FlightPlans", JSON.stringify(flightPlans))
		updatePlanList()
		updateNumberOfPlans()
		form.reset()
	})

	// Populate flight plans listing
	const planList = document.querySelector(".planList")
	const updatePlanList = () => {
		if (flightPlans.length) {
			planList.innerHTML = ""
			for (let i = 0; i < flightPlans.length; i++) {
				planList.innerHTML += `<a href="#!" class="collection-item" data-index="${i}">${flightPlans[i].title}</a>`
			}
		}
	}

	// Check if there are some stored flight plans
	if (flightPlans.length == 0) {
		let storedPlans = localStorage.getItem("FlightPlans")
		if (storedPlans != null) {
			flightPlans = JSON.parse(storedPlans)
			updatePlanList()
		}
	}

	// Display the number of flight plans above the list of plans
	const planCounter = document.querySelector(".planCounter")
	const updateNumberOfPlans = () => {
		let plansCounter = flightPlans.length
		planCounter.innerHTML = `There are ${plansCounter} stored flight plans.`
	}

	// Activate plan from the list
	const planItem = document.querySelector(".collection")
	planItem.addEventListener("click", (e) => {
		let activeItems = document.getElementsByClassName("active")
		let activeItemsLength = activeItems.length

		if (activeItemsLength) {
			for (i = 0; i < activeItemsLength; i++) {
				activeItems[i].classList.remove("active")
			}
		}

		if (e.target.classList.contains("collection-item")) {
			let itemIndex = e.target.getAttribute("data-index")
			path.clear()

			let coords = flightPlans[itemIndex].coords
			coords.forEach((coord) => {
				path.push(new google.maps.LatLng(coord.lat, coord.lng))
			})

			polyline.setMap(map)

			e.target.classList.add("active")
			resetBtn.classList.remove("disabled")
			btnSaveFlight.classList.add("disabled")
		}
	})

	// Reset map
	const resetBtn = document.querySelector("#resetPlan")
	resetBtn.addEventListener("click", (e) => {
		path.clear()
		if (!e.target.classList.contains("disabled")) {
			e.target.classList.add("disabled")
		}
		if (!btnSaveFlight.classList.contains("disabled")) {
			btnSaveFlight.classList.add("disabled")
		}
		deactivatePlans()
	})

	const deactivatePlans = () => {
		let activeItems = document.getElementsByClassName("active")
		let activeItemsLength = activeItems.length

		if (activeItemsLength) {
			for (i = 0; i < activeItemsLength; i++) {
				activeItems[i].classList.remove("active")
			}
		}
	}
}

const error = (err) => {
	console.warn(`ERROR(${err.code}: ${err.message})`)
}

navigator.geolocation.getCurrentPosition(success, error, options)
