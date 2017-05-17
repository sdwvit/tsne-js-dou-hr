// create main global object
const tsnejs = window.tsnejs || { REVISION: 'ALPHA' };

function assert(condition, message) {
	if (!condition) { throw message || 'Assertion failed'; }
}

// utilitity that creates contiguous vector of zeros of size n
function zeros(n) {
	if (typeof (n) === 'undefined' || isNaN(n)) { return []; }
	if (typeof ArrayBuffer === 'undefined') {
		// lacking browser support
		const arr = new Array(n);
		for (let i = 0; i < n; i++) { arr[i] = 0; }
		return arr;
	}
	return new Float64Array(n); // typed arrays are faster
}

// return 0 mean unit standard deviation random number
let returnCache = false;
let gaussCache = 0.0;
function gaussRandom() {
	if (returnCache) {
		returnCache = false;
		return gaussCache;
	}
	const u = (2 * Math.random()) - 1;
	const v = (2 * Math.random()) - 1;
	const r = (u * u) + (v * v);
	if (r === 0 || r > 1) return gaussRandom();
	const c = Math.sqrt((-2 * Math.log(r)) / r);
	gaussCache = v * c; // cache this for next function call for efficiency
	returnCache = true;
	return u * c;
}

// return random normal number
function randn(mu, std) {
	return mu + (gaussRandom() * std);
}

// utility that returns 2d array filled with random numbers
// or with value s, if provided
function randn2d(n, d, s) {
	const uses = typeof s !== 'undefined';
	const x = [];
	for (let i = 0; i < n; i++) {
		const xhere = [];
		for (let j = 0; j < d; j++) {
			if (uses) {
				xhere.push(s);
			} else {
				xhere.push(randn(0.0, 1e-4));
			}
		}
		x.push(xhere);
	}
	return x;
}

// compute L2 distance between two vectors
function computeVectorDistance(x1, x2) {
	const D = x1.length;
	let d = 0;
	for (let i = 0; i < D; i++) {
		const x1i = x1[i];
		const x2i = x2[i];
		d += (x1i - x2i) * (x1i - x2i);
	}
	return d;
}

// compute pairwise distance in all vectors in X
function pairwiseDistances(X) {
	const N = X.length;
	const dist = zeros(N * N); // allocate contiguous array
	for (let i = 0; i < N; i++) {
		for (let j = i + 1; j < N; j++) {
			const d = computeVectorDistance(X[i], X[j]);
			dist[(i * N) + j] = d;
			dist[(j * N) + i] = d;
		}
	}
	return dist;
}

// helper function
function sign(x) {
	if (x > 0) {
		return 1;
	}
	if (x < 0) {
		return -1;
	}
	return 0;
}

/**
	Data: набор данных X = {x1, x2, …, xn},
	параметр функции потерь: перплексия Perp,
	Параметры оптимизации: количество итераций T, скорость обучения η, момент α(t).
	Result: представление данных Y(T) = {y1, y2, …, yn} (в 2D или 3D).
	begin
		вычислить попарное сходство pj|i c перплексией Perp (используя формулу 1)
		установить pij = (pj|i + pi|j)/2n
		инициализировать Y(0) = {y1, y2, …, yn} точками нормального распределения (mean=0, sd=1e-4)
		for t = 1 to T do
			вычислить сходство точек в пространстве отображения qij (по формуле 4)
			вычислить градиент δCost/δy (по формуле 5)
			установить Y(t) = Y(t-1) + ηδCost/δy + α(t)(Y(t-1) - Y(t-2))
		end
	end
 **/

function init() {
	// compute (p_{i|j} + p_{j|i})/(2n)
	function d2p(pairwiseDistances_, perplexity, precision) {
		const rootOfDistancesArrayLength = Math.sqrt(pairwiseDistances_.length); // this better be an integer
		const distancesArrayLength = Math.floor(rootOfDistancesArrayLength);
		assert(distancesArrayLength === rootOfDistancesArrayLength, 'D should have square number of elements.');
		const entropyTarget = Math.log(perplexity); // target entropy of distribution
		const probabilityMatrix = zeros(distancesArrayLength * distancesArrayLength); // temporary probability matrix

		const prow = zeros(distancesArrayLength); // a temporary storage compartment
		for (let i = 0; i < distancesArrayLength; i++) {
			let betamin = -Infinity;
			let betamax = Infinity;
			let beta = 1; // initial value of precision
			let done = false;
			const maxtries = 50;

			// perform binary search to find a suitable precision beta
			// so that the entropy of the distribution is appropriate
			let iteration = 0;
			while (!done) {
				// debugger;

				// compute entropy and kernel row with beta precision
				let psum = 0.0;
				for (let j = 0; j < distancesArrayLength; j++) {
					let probabilityJ = Math.exp(-pairwiseDistances_[i * distancesArrayLength + j] * beta);
					if (i === j) { probabilityJ = 0; } // we dont care about diagonals
					prow[j] = probabilityJ;
					psum += probabilityJ;
				}
				// normalize p and compute entropy
				let entropy = 0.0;
				for (let j = 0; j < distancesArrayLength; j++) {
					let probabilityJ;
					if (psum === 0) {
						probabilityJ = 0;
					} else {
						probabilityJ = prow[j] / psum;
					}
					prow[j] = probabilityJ;
					if (probabilityJ > 1e-7) entropy -= probabilityJ * Math.log(probabilityJ);
				}

				// adjust beta based on result
				if (entropy > entropyTarget) {
					// entropy was too high (distribution too diffuse)
					// so we need to increase the precision for more peaky distribution
					betamin = beta; // move up the bounds
					if (betamax === Infinity) {
						beta *= 2;
					} else {
						beta = (beta + betamax) / 2;
					}
				} else {
					// converse case. make distrubtion less peaky
					betamax = beta;
					if (betamin === -Infinity) {
						beta /= 2;
					} else {
						beta = (beta + betamin) / 2;
					}
				}

				// stopping conditions: too many tries or got a good precision
				iteration++;
				if (Math.abs(entropy - entropyTarget) < precision) {
					done = true;
				}
				if (iteration >= maxtries) {
					done = true;
				}
			}

			// console.log('data point ' + i + ' gets precision ' + beta + ' after ' + num + ' binary search steps.');
			// copy over the final prow to P at row i
			for (let j = 0; j < distancesArrayLength; j++) {
				probabilityMatrix[i * distancesArrayLength + j] = prow[j];
			}
		} // end loop over examples i

		// symmetrize P and normalize it to sum to 1 over all ij
		const Pout = zeros(distancesArrayLength * distancesArrayLength);
		const N2 = distancesArrayLength * 2;
		for (let i = 0; i < distancesArrayLength; i++) {
			for (let j = 0; j < distancesArrayLength; j++) {
				Pout[i * distancesArrayLength + j] = Math.max((probabilityMatrix[i * distancesArrayLength + j] + probabilityMatrix[j * distancesArrayLength + i]) / N2, 1e-100);
			}
		}

		return Pout;
	}

	function tSNE(opt = {}) {
		tSNE.perplexity = opt.perplexity || 30; // effective number of nearest neighbors
		tSNE.dim = opt.dim || 2; // by default 2-D tSNE
		tSNE.epsilon = opt.epsilon || 10; // learning rate

		tSNE.iter = 0;
	}

	tSNE.prototype = {

		// this function takes a set of high-dimensional points
		// and creates matrix P from them using gaussian kernel
		initDataRaw(X) {
			const N = X.length;
			const D = X[0].length;
			assert(N > 0, ' X is empty? You must have some data!');
			assert(D > 0, ' X[0] is empty? Where is the data?');
			const pairwiseDistancesOfInput = pairwiseDistances(X); // convert X to distances using gaussian kernel
			this.P = d2p(pairwiseDistancesOfInput, this.perplexity, 1e-4); // attach to object
			this.N = N; // back up the size of the dataset
			this.initSolution(); // refresh this
		},

		// this function takes a given distance matrix and creates
		// matrix P from them.
		// D is assumed to be provided as a list of lists, and should be symmetric
		initDataDist(distancesMatrix) {
			const N = distancesMatrix.length;
			assert(N > 0, ' X is empty? You must have some data!');
			// convert D to a (fast) typed array version
			const convertedDistances = zeros(N * N); // allocate contiguous array
			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					const d = distancesMatrix[i][j];
					convertedDistances[i * N + j] = d;
					convertedDistances[j * N + i] = d;
				}
			}
			this.P = d2p(convertedDistances, this.perplexity, 1e-4);
			this.N = N;
			this.initSolution(); // refresh this
		},

		// (re)initializes the solution to random
		initSolution() {
			// generate random solution to t-SNE
			this.solution = randn2d(this.N, this.dim); // the solution
			this.gains = randn2d(this.N, this.dim, 1.0); // step gains to accelerate progress in unchanging directions
			this.ystep = randn2d(this.N, this.dim, 0.0); // momentum accumulator
			this.iter = 0;
		},

		// return pointer to current solution
		getSolution() {
			return this.solution;
		},

		// perform a single step of optimization to improve the embedding
		step() {
			this.iter += 1;
			const N = this.N;

			const cg = this.costAndGradient(this.solution); // evaluate gradient
			const cost = cg.cost;
			const grad = cg.grad;

			// perform gradient step
			const ymean = zeros(this.dim);
			for (let i = 0; i < N; i++) {
				for (let d = 0; d < this.dim; d++) {
					const gid = grad[i][d];
					const sid = this.ystep[i][d];
					const gainid = this.gains[i][d];

					// compute gain update
					let newgain = sign(gid) === sign(sid) ? gainid * 0.8 : gainid + 0.2;
					if (newgain < 0.01) newgain = 0.01; // clamp
					this.gains[i][d] = newgain; // store for next turn

					// compute momentum step direction
					const momval = this.iter < 250 ? 0.5 : 0.8;
					const newsid = momval * sid - this.epsilon * newgain * grad[i][d];
					this.ystep[i][d] = newsid; // remember the step we took

					// step!
					this.solution[i][d] += newsid;

					ymean[d] += this.solution[i][d]; // accumulate mean so that we can center later
				}
			}

			// reproject Y to be zero mean
			for (let i = 0; i < N; i++) {
				for (let d = 0; d < this.dim; d++) {
					this.solution[i][d] -= ymean[d] / N;
				}
			}

			if (this.iter % 100 === 0) console.log(`iter ${this.iter}, cost: ${cost}`);
			return cost; // return current cost
		},

		// return cost and gradient, given an arrangement
		costAndGradient(solution) {
			const N = this.N;
			const dimentions = this.dim; // dim of output space
			const P = this.P;

			const pmul = this.iter < 100 ? 4 : 1; // trick that helps with local optima

			// compute current Q distribution, unnormalized first
			const Qu = zeros(N * N);
			let qsum = 0.0;
			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					let dsum = 0.0;
					for (let d = 0; d < dimentions; d++) {
						const dhere = solution[i][d] - solution[j][d];
						dsum += dhere * dhere;
					}
					const qu = 1.0 / (1.0 + dsum); // Student t-distribution
					Qu[i * N + j] = qu;
					Qu[j * N + i] = qu;
					qsum += 2 * qu;
				}
			}
			// normalize Q distribution to sum to 1
			const NN = N * N;
			const Q = zeros(NN);
			for (let q = 0; q < NN; q++) { Q[q] = Math.max(Qu[q] / qsum, 1e-100); }

			let cost = 0.0;
			const grad = [];
			for (let i = 0; i < N; i++) {
				const gsum = new Array(dimentions); // init grad for point i
				for (let d = 0; d < dimentions; d++) { gsum[d] = 0.0; }
				for (let j = 0; j < N; j++) {
					cost += -P[i * N + j] * Math.log(Q[i * N + j]); // accumulate cost (the non-constant portion at least...)
					const premult = 4 * (pmul * P[i * N + j] - Q[i * N + j]) * Qu[i * N + j];
					for (let d = 0; d < dimentions; d++) {
						gsum[d] += premult * (solution[i][d] - solution[j][d]);
					}
				}
				grad.push(gsum);
			}

			return { cost, grad };
		},
	};

	tsnejs.tSNE = tSNE; // export tSNE class
}

init();
