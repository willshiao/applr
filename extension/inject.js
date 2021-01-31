(function () {
function checkExistence(root) {
  const hasInput = (root.querySelector('input[type="text"]') !== null)
  const hasSelect = (root.querySelector('select') !== null)
  const hasFile = (root.querySelector('div.drop-zone') !== null)
  const hasCheckbox = (root.querySelector('input[type="checkbox"]') !== null)
  return { hasInput, hasSelect, hasFile, hasCheckbox }
}

// To allow for multiple injections, we use let
const fieldCounter = {}
console.log('secret token: ', secretToken)

const fieldLabels = Array.from(document.querySelectorAll('div#application div.field>label:first-child, div#application div.field>fieldset>legend>label'))
  .filter(el => {
    let parent = el.parentNode
    if (parent.nodeName === 'LEGEND') {
      parent = parent.parentNode.parentNode
      console.log('Parent:', parent)
    }
    console.log('El: ', el, '; Direct Parent: ', el.parentNode, '; Real Parent: ', parent)
    // Repeated from below, should restructure this better
    const { hasInput, hasSelect, hasFile, hasCheckbox } = checkExistence(parent)
    return hasInput || hasSelect || hasFile || hasCheckbox
  })
const fields = fieldLabels
  .map(el => ((el.parentNode.nodeName === 'LEGEND') ? el.parentNode.parentNode.parentNode : el.parentNode))

const fieldNames = fieldLabels.map(el => el.innerText)
  .map(text => text.trim())
  .map(text => text.split('\n')[0])

const fieldInfo = fieldNames
  .map((fieldName, idx) => {
    const required = (fieldName[fieldName.length - 1] === '*')
    const el = fields[idx]
    let name = required ? fieldName.slice(0, fieldName.length - 1).trim() : fieldName

    if (name in fieldCounter) {
      fieldCounter[name]++;
      name += `[${fieldCounter[name]}]`
    } else {
      fieldCounter[name] = 0
    }

    return {
      required,
      name,
      el,
      ...checkExistence(el)
    }
  })

function getInfo (oldInfo) {
  return oldInfo.map(info => {
    let { el, hasInput, hasSelect, hasFile, hasCheckbox } = info
    let value = null
    let extraValue = null
    let niceValue = null

    if (hasCheckbox) {
      const input = el.querySelector('input[type="text"]')
      if (input && input.style.display === 'none') {
        value = el.querySelector('input[type="checkbox"]').value
        hasInput = false
      }
    }
    if (hasSelect) {
      console.log('Trying to get stuff for el: ', el)
      value = el.querySelector('select').value
      niceValue = el.querySelector('span.select2-chosen').innerText
    } else if (hasInput) {
      const inputs = el.querySelectorAll('input[type="text"]')
      // Handle special "fake input" cases
      if (inputs[0].className.includes('select')) {
        console.log('Fake input detected!')
        value = el.querySelector('input[type="hidden"]').value
        niceValue = el.querySelector('span.select2-chosen').innerText
      } else {
        value = inputs[0].value
        if (inputs.length > 1) {
          console.log(el, 'has', inputs.length, 'inputs!')
          extraValue = inputs[1].value
        }
      }
    } else if (hasFile) {
      console.log('Currently not handling files :(')
    } else {
      console.log('Unknown field type :(')
    }

    return {
      ...info,
      value,
      extraValue,
      niceValue
    }
  })
}

function setInfo (newInfo) {
  newInfo.forEach(info => {
    let { el, hasInput, hasSelect, hasFile, hasCheckbox, value, extraValue, niceValue } = info
    if (!value) {
      console.log('Missing value for: ', info, 'skipping...')
      return null
    }
    if (hasCheckbox) {
      if (value === 'true' || value === 'false') {
        el.querySelector('input[type="checkbox"]').value = value
        hasInput = false
      }
    }
    if (hasSelect) {
      el.querySelector('select').value = value
      el.querySelector('span.select2-chosen').innerText = niceValue
      // Change color
      const selectDiv = el.querySelector('.select2-default')
      if (!selectDiv) {
        console.log('Missing select div for: ', el)
        return null
      }
      selectDiv.className = selectDiv.className
        .split(' ')
        .filter(n => n !== 'select2-default')
        .join(' ')
    } else if (hasInput) {
      const inputs = el.querySelectorAll('input[type="text"]')
      // Handle special "fake input" cases
      if (inputs[0].className.includes('select')) {
        console.log('Fake input detected!')
        el.querySelector('input[type="hidden"]').value = value
        el.querySelector('span.select2-chosen').innerText = niceValue
        // Change color
        const selectDiv = el.querySelector('.select2-default')
        if (!selectDiv) {
          console.log('Missing select div for: ', el)
          return null
        }
        selectDiv.className = selectDiv.className
          .split(' ')
          .filter(n => n !== 'select2-default')
          .join(' ')
      } else {
        inputs[0].value = niceValue || value
        if (extraValue && inputs.length > 1) {
          inputs[1].value = extraValue
        }
      }
    } else if (hasFile) {
      console.log('Currently not handling files :(')
    } else {
      console.log('Unknown field type :(')
    }
  })
}

function rehydrateEls(data) {
  data.forEach((item, idx) => {
    item.el = fields[idx]
  })
  return data
}

// const sample = JSON.parse(`[{"required":true,"name":"First Name","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"William"},{"required":true,"name":"Last Name","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Shiao"},{"required":true,"name":"Email","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"willshiao@gmail.com"},{"required":true,"name":"Phone","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"3106914266"},{"required":true,"name":"Location (City)","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Arcadia, California, United States"},{"required":true,"name":"Resume/CV","el":{},"hasInput":false,"hasSelect":false,"hasFile":true,"value":null},{"required":false,"name":"Cover Letter","el":{},"hasInput":false,"hasSelect":false,"hasFile":true,"value":null},{"required":true,"name":"Have you ever worked for a Sony company previously?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"Are you authorized to work in the United States?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Maybe"},{"required":true,"name":"Will you now, or in the future, require sponsorship to work in the United States?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Maybe"},{"required":true,"name":"Will you need relocation assistance to work at this role's specified location?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"Are you related to, or in a shared housing situation with, anyone who currently works for SIE or any SIE-affiliated studios?","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"If yes, please state their name, the department or studio they work for, and their job title (if you know it).","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"By selecting \\"Yes\\", I am certifying that, to the best of my knowledge, the information I have provided in this employment application is true and correct.","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Gender","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Are you Hispanic/Latino?","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"No"},{"required":false,"name":"Please identify your race","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Veteran Status","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Disability Status","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"2"}]`)
// rehydrateEls(sample)
// setInfo(sample)

// console.log(fieldLabels)
// console.log(fields)
// console.log(fieldNames)
// console.log(fieldInfo)
// console.log(getInfo(fieldInfo))
// console.log(JSON.stringify(getInfo(fieldInfo)))
async function saveFormValues() {
  const res = await fetch('http://localhost:5000/save', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.1qmoIT5HL0HA7PNzXykGC1YbjBmnAelbEl4X77U1-Ig'
    },
    body: JSON.stringify(getInfo(fieldInfo))
  })
  console.log('Got: ', await res.json())
}

function getAppInfo() {
  const companyName = document.querySelector('span.company-name').innerText.slice(3)
  const position = document.querySelector('h1.app-title').innerText
  // strip out query string
  const link = window.location.origin + window.location.pathname
  return { companyName, position, link }
}

async function saveApplicationValues() {
  const { companyName, position, link } = getAppInfo()
  const res = await fetch('http://localhost:5000/applications', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.1qmoIT5HL0HA7PNzXykGC1YbjBmnAelbEl4X77U1-Ig'
    },
    body: JSON.stringify({
      cname: companyName,
      link,
      job: position
    })
  })
  console.log('Saved application: ', await res.json())
}

async function loadFormValues() {
  const res = await fetch('http://localhost:5000/populate', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6M30.1qmoIT5HL0HA7PNzXykGC1YbjBmnAelbEl4X77U1-Ig'
    },
    body: JSON.stringify(fieldInfo)
  })
  const { body } = await res.json()
  rehydrateEls(body)
  setInfo(body)
}

document.querySelector('#submit_app')
  .addEventListener('click', async (evt) => {
    evt.preventDefault()
    console.log('Got form submit')
    await Promise.all([saveApplicationValues(), saveFormValues()])
    console.log('Saved application values')
  })

loadFormValues()

// saveFormValues()
// saveApplicationValues()
// console.log(getInfo(fieldInfo))
})()
