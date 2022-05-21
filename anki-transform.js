const cheerio = require('cheerio')

function stripDoubleQuotes(csv) {
	let s = ""
	let i = 0 
	while(i < csv.length) {
		if(i !== 0 && csv[i - 1] === '"' && csv[i] === '"') {
			i++
			continue	
		}

		s+= csv[i++]
	}

	return s
}

function putBackDoubleQuotes(csv) {
	let s = ""
	let i = 0
	while(i < csv.length) {
		if(csv[i] === '"') {
			s += '"'
		}

		s+= csv[i++]
	}

	return s
}

function group(csv) {
	const all = []
	let i = 0
	let n = 0
	while(i < csv.length) {
		const sections = []
		for(let j = 0; j < 2; j++) {
			let s = ""
			while(i < csv.length && csv[i] != "\t") {
				s += csv[i++]
			}
			i++
			sections.push(s)
		}

		let s = ""
		while(i < csv.length && csv[i] != "\n") {
			s += csv[i++]	
		}

		s += "\n"
		i++
		sections.push(s)
		all.push(sections)
	}

	return all
}

function unGroup(all) {
	let s = ""
	for(const card of all) {
		s += `"${putBackDoubleQuotes(card[0].slice(1, card[0].length - 1))}"` + '\t' + card[1] + '\t' + card[2]
	}

	return s
}

module.exports = function ankiTransform(languageReactorCsvExport) {
	const csv = stripDoubleQuotes(languageReactorCsvExport)

	const cards = group(csv)

	const altered = cards.map(card => {
		const $ = cheerio.load(card[0], null, false)

		const lines = $('.dc-line')
		const translation = lines.find('.dc-translation')
		const original = lines.find('.dc-gap')
		const sound = `<span>${card[1]}</span>`
		const node = `<div class="dc-line">{{c1::${translation.html()}::${original.html()}}}${sound}</div>`

		translation.parent().replaceWith(node)
		translation.parent().append(sound)

		return [
			$.html(),
			original.html(),
			card[2],
		]
	})

	return unGroup(altered)
}

