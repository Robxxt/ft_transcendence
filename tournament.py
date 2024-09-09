import random
from typing import List, Optional

class Game:
    def __init__(self, player1: Optional[str], player2: Optional[str]):
        self.player1 = player1
        self.player2 = player2
        self.time = None
        self.result = None
        self.winner = None

class TournamentNode:
    def __init__(self, game: Game):
        self.game = game
        self.left = None
        self.right = None

class Tournament:
    def __init__(self, players: List[str]):
        self.players = players
        self.root = self._create_tournament_tree(players)

    def _create_tournament_tree(self, players: List[str]) -> Optional[TournamentNode]:
        if not players:
            return None

        random.shuffle(players)
        return self._build_tree(players)

    def _build_tree(self, players: List[str]) -> Optional[TournamentNode]:
        if not players:
            return None
        if len(players) == 1:
            return TournamentNode(Game(players[0], None))
        
        mid = len(players) // 2
        node = TournamentNode(Game(None, None))
        node.left = self._build_tree(players[:mid])
        node.right = self._build_tree(players[mid:])
        return node

    def update_game_result(self, player1: str, player2: str, winner: str, time: str):
        self._update_game_result_recursive(self.root, player1, player2, winner, time)

    def _update_game_result_recursive(self, node: Optional[TournamentNode], player1: str, player2: str, winner: str, time: str) -> bool:
        if not node:
            return False

        game = node.game
        if (game.player1 == player1 and game.player2 == player2) or (game.player1 == player2 and game.player2 == player1):
            game.winner = winner
            game.time = time
            game.result = f"{winner} won"
            return True

        if self._update_game_result_recursive(node.left, player1, player2, winner, time):
            node.game.player1 = winner
            return True

        if self._update_game_result_recursive(node.right, player1, player2, winner, time):
            node.game.player2 = winner
            return True

        return False

    def update_tournament_plan(self):
        self._update_tournament_plan_recursive(self.root)

    def _update_tournament_plan_recursive(self, node: Optional[TournamentNode]):
        if not node:
            return

        if node.left and node.right:
            left_winner = node.left.game.winner
            right_winner = node.right.game.winner
            if left_winner and right_winner:
                node.game.player1 = left_winner
                node.game.player2 = right_winner

        self._update_tournament_plan_recursive(node.left)
        self._update_tournament_plan_recursive(node.right)

    def print_tournament(self):
        print("Tournament Structure:")
        self._print_tournament_recursive(self.root, 0)

    def _print_tournament_recursive(self, node: Optional[TournamentNode], depth: int):
        if not node:
            return

        indent = "  " * depth
        game = node.game
        player1 = game.player1 or "TBD"
        player2 = game.player2 or "TBD"
        
        print(f"{indent}{player1} vs {player2}")
        if game.winner:
            print(f"{indent}Result: {game.result} (Time: {game.time})")

        self._print_tournament_recursive(node.left, depth + 1)
        self._print_tournament_recursive(node.right, depth + 1)

if __name__ == "__main__":
    # Example usage
    players = ["Player A", "Player B", "Player C", "Player D", "Player E"]
    tournament = Tournament(players)

    print("Initial Tournament Plan:")
    tournament.print_tournament()

    # Update some game results
    tournament.update_game_result("Player A", "Player B", "Player A", "15:30")
    tournament.update_game_result("Player C", "Player D", "Player C", "16:45")
    tournament.update_game_result("Player E", None, "Player E", "17:00")  # Bye game

    # Update tournament plan
    tournament.update_tournament_plan()

    print("\nUpdated Tournament Plan:")
    tournament.print_tournament()

    # Update final game
    tournament.update_game_result("Player A", "Player C", "Player A", "18:30")
    tournament.update_tournament_plan()

    print("\nFinal Tournament Result:")
    tournament.print_tournament()
