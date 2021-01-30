const fieldLabels = Array.from(document.querySelectorAll('div.field>label:first-child'))
const fields = fieldLabels.map(el => el.parentNode)
const fieldNames = fieldLabels.map(el => el.innerText)
  .map(text => text.trim())
  .map(text => text.split('\n')[0])
const fieldInfo = fieldNames
  .map((fieldName, idx) => {
    const required = (fieldName[fieldName.length - 1] === '*')
    const el = fields[idx]
    const hasInput = (el.querySelector('input[type="text"]') !== null)
    const hasSelect = (el.querySelector('select') !== null)
    const hasFile = (el.querySelector('div.drop-zone') !== null)

    return {
      required,
      name: required ? fieldName.slice(0, fieldName.length - 1).trim() : fieldName,
      el,
      hasInput,
      hasSelect,
      hasFile
    }
  })

function getInfo (oldInfo) {
  return oldInfo.map(info => {
    const { el, hasInput, hasSelect, hasFile } = info
    let value = null

    if (hasInput) {
      value = el.querySelector('input[type="text"]').value
    } else if (hasSelect) {
      console.log('Trying to get stuff for el: ', el)
      value = el.querySelector('select').value
    } else if (hasFile) {
      console.log('Currently not handling files :(')
    } else {
      console.log('Unknown field type :(')
    }

    return {
      ...info,
      value
    }
  })
}

function setInfo (newInfo) {
  newInfo.forEach(info => {
    const { el, hasInput, hasSelect, hasFile, value } = info
    if (!value) {
      console.log('Missing value for: ', info, 'skipping...')
      return null
    }
    if (hasInput) {
      el.querySelector('input[type="text"]').value = value
    } else if (hasSelect) {
      el.querySelector('select').value = value
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

const sample = JSON.parse(`[{"required":true,"name":"First Name","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"William"},{"required":true,"name":"Last Name","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Shiao"},{"required":true,"name":"Email","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"willshiao@gmail.com"},{"required":true,"name":"Phone","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"3106914266"},{"required":true,"name":"Location (City)","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Arcadia, California, United States"},{"required":true,"name":"Resume/CV","el":{},"hasInput":false,"hasSelect":false,"hasFile":true,"value":null},{"required":false,"name":"Cover Letter","el":{},"hasInput":false,"hasSelect":false,"hasFile":true,"value":null},{"required":true,"name":"Have you ever worked for a Sony company previously?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"Are you authorized to work in the United States?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Maybe"},{"required":true,"name":"Will you now, or in the future, require sponsorship to work in the United States?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Maybe"},{"required":true,"name":"Will you need relocation assistance to work at this role's specified location?","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"Are you related to, or in a shared housing situation with, anyone who currently works for SIE or any SIE-affiliated studios?","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"If yes, please state their name, the department or studio they work for, and their job title (if you know it).","el":{},"hasInput":true,"hasSelect":false,"hasFile":false,"value":"Yes"},{"required":true,"name":"By selecting \\"Yes\\", I am certifying that, to the best of my knowledge, the information I have provided in this employment application is true and correct.","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Gender","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Are you Hispanic/Latino?","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"No"},{"required":false,"name":"Please identify your race","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Veteran Status","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"1"},{"required":false,"name":"Disability Status","el":{},"hasInput":false,"hasSelect":true,"hasFile":false,"value":"2"}]`)
rehydrateEls(sample)
setInfo(sample)

// console.log(fieldLabels)
// console.log(fields)
// console.log(fieldNames)
// console.log(fieldInfo)
// console.log(getInfo(fieldInfo))
// console.log(JSON.stringify(getInfo(fieldInfo)))
