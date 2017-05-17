const coolCities = [
	'kyiv',
	'kiev',
	'lviv',
	'lvov',
	'киев',
	'київ',
	'львов',
	'львів',
	'одесса',
	'одеса',
	'харків',
	'харьков',
];

const mainTechs = [
	'Scala',
	'Java',
	'C#/.NET',
	'Python',
	'PHP',
	'JavaScript',
	'HTML/CSS/JavaScript',
	'Swift',
	'Objective-Swift',
	'Objective-C',
	'C++',
	'C',
	'Delphi',
	'Embedded',
	'Ruby/Rails',
	'Perl',
];

const weights = {
	/**
	 * @return {number}
	 */
	Город(v) {
		if (coolCities.indexOf(v.toLowerCase()) >= 0) {
			return 1.0;
		}
		return 0.0;
	},
	exp(v) { return Math.min(parseFloat(v), 5.0) / 2.5; },
	'Стаж на текущем месте работы': function calc(v) {
		if (parseFloat(v) >= 1.0) {
			return 1.0;
		}
		return 0.0;
	},
	'Опыт.работы.на.текущем.месте': function calc(v) {
		if (parseFloat(v) >= 1.0) {
			return 1.0;
		}
		return 0.0;
	},
	/**
	 * @return {number}
	 */
	Специализация(v) {
		if (mainTechs.contains(v)) {
			return 1.0;
		}
		return 0.0;
	},
	'Язык.программирования': function calc(v) {
		if (mainTechs.contains(v)) {
			return 1.0;
		}
		return 0.0;
	},
	/**
	 * @return {number}
	 */
	Должность(v) {
		if (v.toLowerCase().indexOf('mid') >= 0) {
			return 0.5;
		}
		if (v.toLowerCase().indexOf('senior') >= 0) {
			return 1.0;
		}
		if (v.toLowerCase().indexOf('lead') >= 0) {
			return 1.5;
		}
		return 0.0;
	},
	/**
	 * @return {number}
	 */
	Возраст(v) {
		if (parseInt(v, 10) <= 40) {
			return 1.0;
		}
		return 0.0;
	},
	/**
	 * @return {number}
	 */
	'Еще.студент': function calc(v) {
		if (v === 'False') {
			return 1.0;
		}
		return 0.0;
	},
	'Уровень.английского': function calc(v) {
		if (v.indexOf('продвинутый') >= 0) return 1.5;
		if (v.indexOf('выше среднего') >= 0) return 1.0;
		if (v.indexOf('средний') >= 0) return 0.5;
		if (v.indexOf('ниже среднего') >= 0) return 0.2;
		return 0.0;
	},
};

weights['Общий стаж работы по специальности'] = weights.exp;

export default weights;
