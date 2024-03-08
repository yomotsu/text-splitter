export class TextSplitter extends EventTarget {

	constructor( el ) {

		super();

		this.el = el;
		this.array = split( el.innerHTML );
		this.chars = [];
		this.lines = [];
		this.splitText();
		this.groupLines();

		const onResize = () => {

			this.groupLines();
			this.dispatchEvent( new CustomEvent( 'updated' ) );

		};

		window.addEventListener( 'resize', onResize );

		this.destroy = () => {

			this.revert();
			window.removeEventListener( 'resize', onResize );

		};

	}

	revert() {

		this.chars.forEach( charEl => unwrap( charEl ) );
		this.el.innerHTML = this.el.innerHTML; // join separated text nodes
		this.chars = [];

	}

	splitText() {

		let count = - 1;
		this.el.innerHTML = this.array.map( ( { type, content } ) => {

			if ( type === 'tag' ) {

				return content;

			}

			if ( type === 'space' ) {

				count ++;
				return content;

			}

			count ++;
			return `<span class="char" style="--char-index: ${ count }">${ content }</span>`;

		} ).join( '' );
		this.chars = [ ...this.el.querySelectorAll( '.char' ) ];

	}

	groupLines() {

		const lines = [[]];
		let x = - Infinity;
		let count = 0;
		let lineCount = 0;

		this.chars.forEach( ( charEl ) => {

			const isSameLine = x <= charEl.getBoundingClientRect().left;
			isSameLine ? lines[ lines.length - 1 ].push( charEl ) : lines.push( [ charEl ] );

			count = isSameLine ? count + 1 : 0;
			lineCount = isSameLine ? lineCount : lineCount + 1;
			x = isSameLine ? charEl.getBoundingClientRect().left : - Infinity;

			charEl.style.setProperty( '--char-index-of-line', count );
			charEl.style.setProperty( '--line-index', lineCount );

		} );

		this.lines = lines;

	}

}

function split( string ) {

	const array = [];
	const tag = /^(\s*)?<\/?[a-z](.*?)>(\s*)?/i;
	const space = /^\s+/;

	string = string.replace( space, '' ).replace( /\s+$/, '' );

	while ( string.length !== 0 ) {

		const matchTag = string.match( tag );

		if ( !! matchTag ) {

			array.push( {
				type: 'tag',
				content: matchTag[ 0 ].replace( /^(\s*)(.+)(\s*)$/, '$1$2$3' )
			} );
			string = string.replace( matchTag[ 0 ], '' );
			continue;

		}

		const matchSpace = string.match( space );

		if ( !! matchSpace ) {

			array.push( {
				type: 'space',
				content: ' '
			} );
			string = string.replace( matchSpace[ 0 ], '' );
			continue;

		}

		array.push( {
			type: 'character',
			content: string[ 0 ]
		} );
		string = string.slice( 1 );

	}

	return array;

}

function unwrap( targetEl ) {

	while ( targetEl.firstChild ) {

		targetEl.parentNode.insertBefore( targetEl.firstChild, targetEl );

	}

	targetEl.remove();

}
