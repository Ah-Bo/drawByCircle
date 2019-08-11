const pi = math.pi
const tpi = math.pi * 2
const e = math.e
const i = math.i
let t = 0


function sum(arr) {
	let ret = math.complex(0, 0)
	for (let i = 0; i < arr.length; i++) {
		ret = math.add(ret, arr[i])
	}
	return ret
}

class curve {
	constructor(pathString) {
		this.path = SVG().path(pathString)
		this.pathLength = this.path.length()
		this.pointSet = []
		this.c = []
		this.shape = []
		this.i_e = math.compile('ft * e ^ (-1 * n * i * t) * dt')


		for (let j = 0; j < this.pathLength; j += this.pathLength / 32) {
			this.pointSet.push(math.complex({
				re: this.path.pointAt(j).x,
				im: this.path.pointAt(j).y
			}))
		}
	}

	f(t) {
		if (math.floor(this.pointSet.length * t / tpi) == this.pointSet.length) {
			return this.pointSet[this.pointSet.length - 1]
		}
		return this.pointSet[math.floor(this.pointSet.length * t / tpi)]
	}

	i_f(t, cn, dt) {
		dt = dt || 1
		return this.i_e.evaluate({
			ft: this.f(t),
			n: cn,
			t: t,
			dt: dt
		})
	}

	fourierTransform(numOfCircles) {
		const HUGE_NUMBER = 1e4
		const dt = tpi / HUGE_NUMBER
		let sum

		for (let k = 1; k <= numOfCircles; k++) {
			sum = math.complex(0, 0)
			for (let j = 0; j <= tpi; j += dt) {
				sum = math.evaluate('a + b', {
					a: sum,
					b: this.i_f(j, k, dt)
				})
			}

			sum = math.evaluate('a / b', {
				a: sum,
				b: tpi
			})
			this.c.push(sum)

			console.log(100 * k / (numOfCircles * 2 + 1) + '%')
		}

		for (let k = 1; k <= numOfCircles; k++) {
			sum = math.complex(0, 0)
			for (let j = 0; j <= tpi; j += dt) {
				sum = math.evaluate('a + b', {
					a: sum,
					b: this.i_f(j, -1 * k, dt)
				})
			}

			sum = math.evaluate('a / b', {
				a: sum,
				b: tpi
			})
			this.c.push(sum)

			console.log(100 * (numOfCircles + k) / (numOfCircles * 2 + 1) + '%')
		}

		sum = math.complex(0, 0)
		for (let j = 0; j <= tpi; j += dt) {
			sum = math.evaluate('a + b', {
				a: sum,
				b: this.i_f(j, 0, dt)
			})
		}

		sum = math.evaluate('a / b', {
			a: sum,
			b: tpi
		})
		this.c.push(sum)

		console.log('100%')

		for (let t = 0; t <= math.pi * 2; t += 0.01) {
			this.shape.push(this.F(t))
		}
	}

	F(t) {
		let ret = this.c[this.c.length - 1]
		let term = math.compile('c * e ^ (n * i * t)')
		let add = math.compile('a + b')

		for (let i = 0, j = 1; i < (this.c.length - 1) / 2; i++, j++) {
			ret = add.evaluate({
				a: ret,
				b: term.evaluate({
					c: this.c[i],
					n: j,
					t: t
				})
			})
		}

		for (let i = (this.c.length - 1) / 2, j = 1; i < this.c.length - 1; i++, j++) {
			ret = add.evaluate({
				a: ret,
				b: term.evaluate({
					c: this.c[i],
					n: -1 * j,
					t: t
				})
			})
		}

		return ret
	}


	drawcurve() {
		beginShape()
		for (let j = 0; j < this.shape.length; j++) {
			stroke('rgb(0, 255, 0)')
			noFill()
			vertex(this.shape[j].re, this.shape[j].im)
		}
		endShape(CLOSE)


		let sumarr = []
		let pc = this.c.slice(0, (this.c.length - 1) / 2)
		let mc = this.c.slice((this.c.length - 1) / 2, this.c.length - 1)

		sumarr.push(this.c[this.c.length - 1])

		for (let i = 0, pci = 0, mci = 0; i < this.c.length - 1; i++) {

			if (i % 2 == 0) {
				sumarr.push(math.multiply(pc[pci], math.pow(math.e, math.multiply(math.i, (pci + 1) * t))))
				pci++
			} else if (i % 2 == 1) {
				sumarr.push(math.multiply(mc[mci], math.pow(math.e, math.multiply(math.i, -1 * (mci + 1) * t))))
				mci++
			}

			stroke('rgb(255, 255, 255)')
			noFill()

			line(
				sum(sumarr.slice(0, sumarr.length - 1)).re,
				1 * sum(sumarr.slice(0, sumarr.length - 1)).im,
				sum(sumarr).re,
				1 * sum(sumarr).im
			)

			fill('rgb(255, 255, 255)')
			noStroke()

			ellipse(
				sum(sumarr).re,
				1 * sum(sumarr).im,
				4
			)

			stroke('rgba(255, 255, 255, 0.5)')
			noFill()

			ellipse(
				sum(sumarr.slice(0, sumarr.length - 1)).re,
				1 * sum(sumarr.slice(0, sumarr.length - 1)).im,

				2 * math.abs(
					math.subtract(
						sum(sumarr.slice(0, sumarr.length - 1)),
						sum(sumarr)
					)
				)
			)
		}
	}
}


let curve1 = new curve(`M 181.82,474.73 C 181.82,474.73 181.33,429.33 206.55,375.27 174.12,358.54 136.67,330.33 132.67,267.00 131.33,243.00 139.11,189.32 153.67,172.33 149.00,149.33 160.00,94.33 186.33,94.67 212.67,95.00 224.00,129.33 224.00,129.33 224.00,129.33 265.00,114.00 295.00,113.67 325.00,113.33 381.00,135.67 381.00,135.67 381.00,135.67 419.00,85.33 442.33,104.33 456.00,117.00 454.00,179.33 441.33,190.33 453.24,214.70 464.33,270.33 453.67,307.00 443.00,343.67 402.33,381.33 370.33,391.67 368.33,422.67 371.00,474.00 371.00,474.00 371.00,474.00 187.33,474.00 181.82,474.73`)

function setup() {
	curve1.fourierTransform(2)//反正数值越大越精确就对了
	canvas = createCanvas(800, 600)
	canvas.id('mycanvas')
	background(0)
}


function draw() {
	background(0)
	curve1.drawcurve()

	t += 0.05
	if (t >= tpi) {
		t = 0
	}
}