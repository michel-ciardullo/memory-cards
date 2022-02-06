import '../node_modules/bootstrap'
import './scss/style.scss'

// Definition des constantes globales
const BOARD_ELEMENT = document.getElementById( 'board-element' ) as HTMLElement
const TIMER_ELEMENT = document.getElementById('timer-element') as HTMLElement
const FLASH_ELEMENT = document.getElementById('flash-element') as HTMLElement

// Définiton des variables globales

// Matches
let gMatches: Array<any> = []       // Tableau de cartes similaires.
let gNumberMatches = 2  // Nombre de cartes similaires.

// Game/state
let gCanPlay = false    // Le joueur peux jouer ?
let gEndGame = false    // La partie est terminé ?

// Timer
let gTimerIntervalID = 0    // Timer interval id
let gTimerIncrement = 10    // Timer increment (seconds)
let gTimerValue = 0         // Timer value (seconds)

// Pairs
let gMaxPairs = 0       // Nombre de pairs max
let gCountPairs = 0     // Nombre de pairs

// Level
let gLevel = 0
let gLevelStarting = false

// Score
let scores: Array<any> = []

/**
 * éffacer tous les messages flash
 */
function clearFlash() {
  FLASH_ELEMENT.innerHTML = ''
}

/**
 * Afficher un message flash
 *
 * @param color
 * @param message
 */
function drawFlash( color: string, message: string ) {
  const alertElement = document.createElement( 'div' )
  alertElement.className = `alert alert-${color}`
  alertElement.innerHTML = message
  FLASH_ELEMENT.appendChild( alertElement )
}

/**
 * Retourne le score en pourcentage
 *
 * @return {number}
 */
function getPercentageScore() {
  return Math.floor(( gCountPairs * 100 ) / gMaxPairs )
}

/**
 * Range new list cards
 *
 * @param {number} start Start range
 * @param {number} end End range
 * @returns {array}
 */
function range( start: number, end: number ) {
  const list = []
  for (
    let i = start;
    i <= end;
    i++
  ) {
    for (
      let j = 0;
      j < gNumberMatches;
      j++
    ) {
      list.push( i )
    }
  }
  return list
}

/**
 * Shuffle for cards
 *
 * @param {array} cells cards
 * @returns {array}
 */
function shuffle( cells: Array<any> ) {
  return cells.sort( () => .5 - Math.random() )
}

/**
 * Get pathname directory for theme.
 *
 * @param {number} themeSelectedIndex index for directory
 * @returns {string}
 */
function getThemeDirectory( themeSelectedIndex: number ) {
  return !Boolean(themeSelectedIndex) ? 'pokemon' : 'fifa'
}

/**
 * Check if number is pairs
 *
 * @param n
 * @return {boolean}
 */
function isNumberPairs( n: number ) {
  return n % 2 === 0
}

/**
 * Reset all vars
 *
 * @returns {void}
 */
function resetVars() {
  gMatches = []           // Initialise le tableau de matches
  gNumberMatches = 2      // Initialise le nombre de matches requis
  gCountPairs = 0         // Pas de pairs pour le moment

  gCanPlay = false        // Le joueur ne peut pas jouer
  gEndGame = false        // La partie est finie/pas commencer

  gLevelStarting = false

  clearIntervalTimer()    // Clear le timer
  clearFlash()            // Clear les messages flash
}

/**
 * Initialise le timer
 *
 * @returns {void}
 */
function clearIntervalTimer() {
  clearInterval( gTimerIntervalID )
  gTimerIntervalID = 0

  TIMER_ELEMENT.innerText = `00:00`
}

/**
 * Temps du jeux écouler
 *
 * @param {function} endCallback
 */
function startTimer( endCallback: any ) {
  const clockUpdate = function () {
    --gTimerValue

    let seconds = gTimerValue % 60                  // Seconds that cannot be written in minutes
    let minutes = ( gTimerValue - seconds ) / 60    // Gives the seconds that COULD be given in minutes

    // Now in hours, minutes and seconds, you have the time you need.
    TIMER_ELEMENT.innerText = `${minutes}:${seconds}`

    if ( gTimerValue === 0 ) {
      endCallback()
    }
  }

  gTimerIntervalID = setInterval( clockUpdate, 1000 )
}

function getTimerTextValue() {
  let seconds = gTimerValue % 60                  // Seconds that cannot be written in minutes
  let minutes = ( gTimerValue - seconds ) / 60    // Gives the seconds that COULD be given in minutes

  // Now in hours, minutes and seconds, you have the time you need.
  return `${minutes}:${seconds}`
}

function endGame() {
  clearIntervalTimer()

  gCanPlay = false
  gEndGame = true

  if ( gLevelStarting ) {
    scores.push( gCountPairs )

    if ( gLevel < 3 ) {
      gLevel++
      setTimeout( () => startLevel( gLevel ), 5000 )
    } else {
      drawFlash( 'info',
        'La partie est términé.<br>'
        + 'Score: ' + getPercentageScore() + ', <br>'
        + 'Temps restant: ' + getTimerTextValue() + 's'
      )
    }
  }
  else {
    drawFlash( 'info',
      'La partie est términé.<br>'
      + 'Score: ' + getPercentageScore() + ', <br>'
      + 'Temps restant: ' + getTimerTextValue() + 's'
    )
  }
}

/**
 * Starting new game
 *
 * @returns {void}
 */
function startGame() {
  startTimer( endGame )
  gCanPlay = true
}

function startLevel( level: number ) {
  resetVars()

  gLevelStarting = true
  const themeSelectedValue = getThemeDirectory( 0 )

  switch ( level ) {
    // 4 x 4 = 8 -> 2 pair
    case 0:
      gNumberMatches = 2

      // Timer
      gTimerIncrement = 15
      gTimerValue = 30

      makeBoard( 4, 4, themeSelectedValue )
      break

    // 6 x 6 = 36
    // 36 / 2 = 8
    // 8 pairs
    case 1:
      gNumberMatches = 2

      // Timer
      gTimerIncrement = 10
      gTimerValue = 60

      makeBoard( 6, 6, themeSelectedValue )
      break

    // 5 x 6 = 30
    // 30 / 3 = 10
    // 10 triades
    case 2:
      gNumberMatches = 3

      // Timer
      gTimerIncrement = 5
      gTimerValue = 90

      makeBoard( 5, 6, themeSelectedValue )
      break

    default:
      gLevelStarting = false
      break
  }

  if ( gLevelStarting ) {
    startGame()
  }
}

function onClickStartLevel0() {
  startLevel( 0 )
}

function matchedContinue() {
  let matched = true

  // Vérifie si toute la list matchesCards son égale
  for (
    let i = 1;
    i < gMatches.length;
    i++
  ) {
    if ( gMatches[ 0 ].id !== gMatches[ i ].id ) {
      matched = false
      break
    }
  }

  return matched
}

function doCellCompareMatches() {
  let matched = matchedContinue()

  for (
    let i = 0;
    i < gMatches.length;
    i++
  ) {
    // Si les cartes correspond toujours
    if ( matched ) {
      // Si le nombre de cartes nbMatches son pareil
      if ( gMatches.length === gNumberMatches ) {
        gMatches[ i ].target.classList.remove( 'wait' )
        gMatches[ i ].target.classList.add( 'matched' )

        if ( i === gMatches.length - 1 ) {
          gMatches = []
          gCountPairs++
          gTimerValue += gTimerIncrement

          // If all cards turned
          if ( gCountPairs === gMaxPairs ) {
            endGame()
          }
        }
      }
    }
    // Sinon les carte ne coresponde pas
    else {
      gMatches[ i ].target.classList.remove( 'wait' )
    }
  }

  // Si les carte ne coresponde pas
  if ( !matched ) {
    gMatches = []
  }
}

function cellCompareMatches() {
  gCanPlay = false

  setTimeout(() => {
    doCellCompareMatches()
    gCanPlay = true
  }, 300 )
}

/**
 * On cell event listener click
 *
 * @param {Event} event event target click
 * @returns void
 */
function onCellClick( event: Event ) {
  clearFlash()

  if ( gEndGame ) {
    drawFlash( 'warning', 'La partie est terminé, score: ' + getPercentageScore() )
    return
  }

  if ( !gCanPlay ) {
    drawFlash( 'warning', 'Il faut attendre un peux mon jeune' )
    return
  }

  const target = event.currentTarget as any

  if ( target.classList.contains( 'wait' ) ) {
    drawFlash( 'warning', 'Il faut cliquer sur une autre carte' )
  }
  else if ( target.classList.contains( 'matched' ) ) {
    drawFlash( 'warning', 'La carte est deja joué' )
  }
  else {
    // On récupère son identifiant
    let id = parseInt(
      target.getAttribute( 'data-cell' )
    )

    // On ajoute la classe attendre
    target.classList.add( 'wait' )

    // Si la taille du tableau de matches des cartes est plus petit que ${gNumberMatches}
    if ( gMatches.length < gNumberMatches ) {
      // On ajoute la carte au tableau de matches
      gMatches.push( { id, target } )
    }

    // Si la taille du tableau de matches est plus grand que 1, on peut comparez deja deux cartes
    if ( gMatches.length > 1 ) {
      cellCompareMatches()
    }
  }
}

/**
 * Make new board
 *
 * @param {number} nbRow Number of the row
 * @param {number} nbCol Number of the col
 * @param {string} themeSelectedValue pathname for the theme
 */
function makeBoard( nbRow: number, nbCol: number, themeSelectedValue: 'pokemon' | 'fifa' ) {
  // On efface la grille précédente
  BOARD_ELEMENT.innerHTML = ''

  // On calcule la taille total de la grille
  let size = nbRow * nbCol

  // On calcule le total de pairs
  gMaxPairs = ( size / gNumberMatches )

  let cells = range( 1, gMaxPairs )
  cells = shuffle( cells )

  let index = 0
  for (
    let i = 0;
    i < nbRow;
    i++
  ) {
    const trElement = document.createElement( 'tr' )
    for (
      let j = 0;
      j < nbCol;
      j++
    ) {
      const cellNumber = cells[ index ] as any

      // Construction des éléments de la grille
      const tdElement = document.createElement( 'td' )
      tdElement.setAttribute( 'data-cell', cellNumber )

      // Create img
      const imgElement = document.createElement( 'img' )
      imgElement.src = `/assets/img/${themeSelectedValue}/${cellNumber}.png`
      tdElement.appendChild( imgElement )

      // On ajoute un event listener sur chaque cellule pour lancer un tour
      // de jeu à chaque click du joueur
      tdElement.onclick = onCellClick

      // Initialisation du tableau des valeurs de "coups joués"
      trElement.appendChild( tdElement )
      index++
    }
    BOARD_ELEMENT.appendChild( trElement )
  }
}

/**
 * On event submitted new game
 *
 * @param {Event} event
 * @returns
 */
function onSubmitNewGame( event: Event ) {
  event.preventDefault()

  // resets all vars
  resetVars()

  // Récupère l'élément formulaire
  const targetForm = event.target as HTMLFormElement

  // Board size
  const nbRow = parseInt( targetForm[ 'nb-row' ].value )  // récupère le nombre de lignes
  const nbCol = parseInt( targetForm[ 'nb-col' ].value )  // récupère le nombre de colonnes

  let size = nbRow * nbCol                                // Calculer la taille total des pairs
  if ( !isNumberPairs( size ) ) {                         // Si le nombre de paramètres ligne et colonne n'est pas paire
    drawFlash( 'danger', "Le nombre de cases n'est pas paire !" )
    return
  }

  // Nombre de matches
  gNumberMatches = parseInt( targetForm[ 'nb-matches' ].value )

  // Timer
  gTimerIncrement = parseInt( targetForm[ 'time-increment' ].value )
  gTimerValue = parseInt( targetForm[ 'timer' ].value )

  // Themes
  const themeSelected = targetForm[ 'theme' ]
  const themeSelectedIndex = themeSelected.selectedIndex
  const themeSelectedValue = getThemeDirectory( themeSelectedIndex )

  makeBoard( nbRow, nbCol, themeSelectedValue )

  // Start new game
  startGame()
}

/**
 * Entry point
 */
function main() {
  resetVars()

  // @ts-ignore
  document.getElementById('form-element')
    .addEventListener( 'submit', onClickStartLevel0 )

  // @ts-ignore
  document.getElementById( 'start-level')
    .addEventListener( 'click', onSubmitNewGame )
}

// Start event listener dom content loaded
document.addEventListener( 'DOMContentLoaded', main )
