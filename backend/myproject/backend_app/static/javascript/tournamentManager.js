export class TournamentManager {
    constructor() {
        const savedState = localStorage.getItem('tournamentState');
        if (savedState) {
            this.state = JSON.parse(savedState);
        } else {
            const players = JSON.parse(localStorage.getItem('localTournamentPlayers'));
            this.state = {
                currentGame: 1,
                players: players,
                matchups: {
                    game1: {
                        challenger: players.challenger,
                        challengerDisplayName: players.challengerDisplayName,
                        opponent: players.opponents[0].username,
                        opponentDisplayName: players.opponents[0].displayName,
                        winner: null
                    },
                    game2: {
                        challenger: players.opponents[1].username,
                        challengerDisplayName: players.opponents[1].displayName,
                        opponent: players.opponents[2].username,
                        opponentDisplayName: players.opponents[2].displayName,
                        winner: null
                    },
                    game3: {
                        challenger: null, // Will be winner of game1
                        challengerDisplayName: null,
                        opponent: null,  // Will be winner of game2
                        opponentDisplayName: null,
                        winner: null
                    }
                },
                tournamentWinner: null,
                isComplete: false
            };
            this.saveTournamentState();
        }
    }

    getCurrentMatchup() {
        const gameKey = `game${this.state.currentGame}`;
        return this.state.matchups[gameKey];
    }

    updateGameResult(winner) {
        const gameKey = `game${this.state.currentGame}`;
        this.state.matchups[gameKey].winner = winner;

        // If this was game 1 or 2, set up the final match
        if (this.state.currentGame < 3) {
            this.state.currentGame++;
            
            // If both semifinal games are complete, set up the final
            if (this.state.matchups.game1.winner && this.state.matchups.game2.winner) {
                this.state.matchups.game3.challengerDisplayName = this.state.matchups.game1.winner;
                this.state.matchups.game3.challenger = 
                (this.state.matchups.game1.winner === this.state.matchups.game1.challengerDisplayName) ? 
                this.state.matchups.game1.challenger : this.state.matchups.game1.opponent;
                this.state.matchups.game3.opponentDisplayName = this.state.matchups.game2.winner;
                this.state.matchups.game3.opponent = 
                (this.state.matchups.game2.winner === this.state.matchups.game2.challengerDisplayName) ? 
                this.state.matchups.game2.challenger : this.state.matchups.game2.opponent;
            }
        } else {
            // Tournament is complete
            this.state.tournamentWinner = winner;
            this.state.isComplete = true;
        }
        this.saveTournamentState();
    }

    saveTournamentState() {
        localStorage.setItem('tournamentState', JSON.stringify(this.state));
    }

    resetTournament() {
        localStorage.removeItem('tournamentState');
        localStorage.removeItem('gameState');
        localStorage.removeItem('gameResults');
    }

    isTournamentComplete() {
        return this.state.isComplete;
    }

    setupLocalGamePlayers() {
        const currentMatchup = this.getCurrentMatchup();
        const localGamePlayers = {
            challenger: currentMatchup.challenger,
            challengerDisplayName: currentMatchup.challengerDisplayName,
            opponent: currentMatchup.opponent,
            opponentDisplayName: currentMatchup.opponentDisplayName
        };
        localStorage.setItem('localGamePlayers', JSON.stringify(localGamePlayers));
    }
}