import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// since Square now doesn't track state, we will change to the easier functional component
function Square(props) {
    // when a square is clicked,the onClick function provided by the Board is called
    // the net result is Square calls this.handleClick(i) when called
    return (
        <button className='square' onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// initial state is an array of 9 empty values for each square on the board
class Board extends React.Component {
    // each square will receive a value prop that will either be 'X', 'O', or null
    //Next, we need to change what happens when a Square is clicked. The Board component now maintains which squares are filled.
    // We need to create a way for the Square to update the Board’s state.Since state is considered to be private to a component
    // that defines it, we cannot update the Board’s state directly from Square.

    // Instead, we’ll pass down a function from the Board to the Square,
    // and we’ll have Square call that function when a square is clicked. We’ll change the renderSquare method in Board

    // Now we’re passing down two props from Board to Square: value and onClick. The onClick prop is a function that Square can
    // call when clicked
    renderSquare(i) {
        return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)} />;
    }

    render() {
        return (
            <div>
                <div className='board-row'>
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className='board-row'>
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    // this constructor is initializing state
    // In JS classes, you always need to call super when defining a constructor
    // xIsNext sets X to be next move as first move of game by default
    constructor(props) {
        super(props);
        this.state = {
            history    : [
                {
                    squares : Array(9).fill(null),
                },
            ],
            stepNumber : 0,
            xIsNext    : true,
        };
    }

    // .slice() is used to create a copy of the squares array rather than modify it
    //  an ability to undo and redo certain actions is a common requirement in applications. Avoiding direct data mutation
    // lets us keep previous versions of the game’s history intact, and reuse them later.

    // Detecting changes in immutable objects is considerably easier. If the immutable object that is being referenced
    // is different than the previous one, then the object has changed.

    //The main benefit of immutability is that it helps you build pure components in React. Immutable data can easily
    // determine if changes have been made which helps to determine when a component requires re - rendering.

    // xIsNext is a boolean value that is flipped each time its run, a ternary operator checks it and sets to 'X' if true, 'O' if false
    // each time this function is called

    // we run an if statement to see when clicking a box if game has already been won, or it square is not set to null
    // if either are truthy, we do exit the function

    // .concat is used instead of push because it doesn't mutate the original array

    // The stepNumber state we’ve added reflects the move displayed to the user now. After we make a new move,
    // we need to update stepNumber by adding stepNumber: history.length as part of the this.setState argument.
    // This ensures we don’t get stuck showing the same move after a new one has been made

    // We will also replace reading this.state.history with this.state.history.slice(0, this.state.stepNumber + 1).
    // This ensures that if we “go back in time” and then make a new move from that point, we throw away all the “future”
    // history that would now become incorrect.
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history    : history.concat([
                {
                    squares : squares,
                },
            ]),
            stepNumber : history.length,
            xIsNext    : !this.state.xIsNext,
        });
    }

    // we’ll define the jumpTo method in Game to update the stepNumber. We also set xIsNext to true if the number that we’re
    // changing stepNumber to is even, it evaluates to true if remainder divided by 2 is 0
    jumpTo(step) {
        this.setState({
            stepNumber : step,
            xIsNext    : step % 2 === 0,
        });
    }

    // We start by running a function calculateWinner() to see if the game has a winner
    // if it does return that status of who won
    // if not, set status to who goes next

    // For each move in the tic-tac-toes’s game’s history, we create a list item <li> which contains a button <button>.
    // The button has a onClick handler which calls a method called this.jumpTo()

    // Finally, we will modify the Game component’s render method from always rendering the last move to rendering the currently
    // selected move according to stepNumber
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ? `Go to move # ${move}` : `Go to game start`;
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
        let status;
        if (winner) {
            status = `Winner: ${winner}`;
        } else {
            status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
        }

        return (
            <div className='game'>
                <div className='game-board'>
                    <Board squares={current.squares} onClick={(i) => this.handleClick(i)} />
                </div>
                <div className='game-info'>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));

function calculateWinner(squares) {
    const lines = [
        [ 0, 1, 2 ],
        [ 3, 4, 5 ],
        [ 6, 7, 8 ],
        [ 0, 3, 6 ],
        [ 1, 4, 7 ],
        [ 2, 5, 8 ],
        [ 0, 4, 8 ],
        [ 2, 4, 6 ],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [ a, b, c ] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
