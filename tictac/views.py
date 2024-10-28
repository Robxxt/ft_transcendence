from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Room, UserProfile
import json
import logging

# Create your views here.
logger = logging.getLogger(__name__)  # Configure logging

def welcome(request):
	return render(request, 'welcome.html')

def create_room(request):
	if request.method == 'POST':
		try:
			logger.info("Received POST request for creating room.")
			# user = request.user
			user_profile = UserProfile.objects.create(user=f'DefaultUser{UserProfile.objects.count() + 1}')
			name = f'Room-{Room.objects.count() + 1}'
			room = Room.objects.create(name=name, player1=user_profile)
			# room = Room.objects.create(name=name, player1.username)
			logger.info(f"User {user_profile} created room {room.name}.")
			return JsonResponse({'status': 'joined', 'name': room.name})
		except Exception as e:
			logger.error(f"Error retrieving rooms: {e}")
			return JsonResponse({'status': 'Error', 'message': str(e)}, status=500)
	else:
		return JsonResponse({'status': 'Bad Request'}, status=400)

def run_game(request, room_name):
	try:
		room = Room.objects.get(name=room_name)
		player1_name = room.player1.user
		player2_name = room.player2 if room.player2 else "User 2"

		context = {
			'room_name': room_name,
			'player1': player1_name,
			'player2': player2_name
		}

		return render(request, 'index_tictac.html', context)

	except Room.DoesNotExist:
		return JsonResponse({'status': 'Bad Request', 'message': 'Room not found'}, status=400)

@csrf_exempt
def save_game_result(request, room_name):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			game_winner = data.get('winner')
			is_draw = data.get('is_draw')
			logger.info(f"winner is ${game_winner}, is draw: ${is_draw}")
			room = Room.objects.get(name=room_name)

			if is_draw:
				room.player1.draws += 1
				room.player1.games_played += 1
				room.save()
			elif game_winner == 'player1':
				room.player1.wins += 1
				room.player1.games_played += 1
				room.save()
			elif game_winner == 'player2': # and room.player2:
				room.player1.games_played += 1
				room.save()

			return JsonResponse({'status': 'success', 'message': 'Game result saved'})

		except Room.DoesNotExist:
			return JsonResponse({'status': 'Bad Request', 'message': 'Room not found'}, status=400)

		except UserProfile.DoesNotExist:
			return JsonResponse({'status': 'Bad Request', 'message': 'Player profile not found'}, status=400)

	return JsonResponse({'status': 'Bad Request', 'message': 'Invalid request method'}, status=400)

# user clicks 'play tictac' button
# room creates with one user
# button 'add second user'
# play on one page
# save result for one/two user(s)