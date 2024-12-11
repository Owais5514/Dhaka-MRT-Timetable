import datetime
import json
import telebot
from telebot import types
import pytz
from dotenv import load_dotenv
import os


# Load environment variables from .env file
load_dotenv()

# Get the token from the environment variable
TOKEN = os.getenv("TOKEN")

# Create a Telegram bot object
bot = telebot.TeleBot(TOKEN)

current_station = ""

# Handle '/start' command
@bot.message_handler(commands=['start'])
def start_command(message):
    global init_msg
    global user
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    keyboard.add(types.InlineKeyboardButton(text="Timetable", callback_data="back"))
    init_msg = bot.send_message(message.chat.id, "Welcome to Dhaka MRT 6!", reply_markup=keyboard)
    user = message.from_user.first_name
    print(f"User: {user} executed /start command")

# Handle '/help' command
@bot.message_handler(commands=['help'])
def help_command(message):
    help_text = (
        "Welcome to Dhaka MRT 6 Bot!\n\n"
        "Available commands:\n"
        "/start - Start the bot and display the main menu\n"
        "/help - Display this help message\n"
    )
    bot.send_message(message.chat.id, help_text)
    print(f"User: {message.from_user.first_name} executed /help command")

# Handle button clicks
@bot.callback_query_handler(func=lambda call: True)
def button_click_handler(call):
    global current_station

    button_data = call.data
    current_station = button_data
    chat_id = call.message.chat.id
    message_id = call.message.message_id

    if current_station == "back":
        # Create a ReplyKeyboardMarkup object
        keyboard = types.InlineKeyboardMarkup(row_width=2)
        # Add buttons to the keyboard
        stations = ["Uttara North", "Agargoan", "Uttara Center", "Bijoy Sarani", "Uttara South", "Farmgate", "Pallabi", "Karwan Bazar", "Mirpur 11", "Shahbag", "Mirpur 10", "Dhaka University", "Kazipara", "Bangladesh Secretariat", "Sewrapara", "Motijheel"]
        for i in range(0, len(stations), 2):
            keyboard.add(types.InlineKeyboardButton(text=stations[i], callback_data=stations[i]),
                         types.InlineKeyboardButton(text=stations[i+1], callback_data=stations[i+1]))
        # Send the keyboard to the user
        bot.edit_message_text("Choose your current station:", chat_id, message_id, reply_markup=keyboard)
    else:
        input_time = datetime.datetime.now(pytz.timezone('Asia/Dhaka')).strftime("%H:%M")
        input_datetime = datetime.datetime.strptime(input_time, '%H:%M')

        with open('/workspaces/Dhaka-MRT-Timetable/data.json') as f:
            data = json.load(f).get(str(current_station))

        next_closest_times_1 = sorted(data.get("Motijheel"), key=lambda x: (datetime.datetime.strptime(x, '%H:%M') - input_datetime).total_seconds() if datetime.datetime.strptime(x, '%H:%M') > input_datetime else float('inf'))[:3]
        next_closest_times_2 = sorted(data.get("Uttara North"), key=lambda x: (datetime.datetime.strptime(x, '%H:%M') - input_datetime).total_seconds() if datetime.datetime.strptime(x, '%H:%M') > input_datetime else float('inf'))[:3]

        # Create a new inline keyboard
        keyboard = types.InlineKeyboardMarkup(row_width=2)
        # Add inline buttons to the keyboard
        keyboard.add(types.InlineKeyboardButton(text=f"Platform 1 : {', '.join(next_closest_times_1)}", callback_data="back"))
        keyboard.add(types.InlineKeyboardButton(text=f"Platform 2 : {', '.join(next_closest_times_2)}", callback_data="back"))
        # Add the Back button to the bottom of the keyboard
        keyboard.add(types.InlineKeyboardButton(text="Select Station", callback_data="back"))

        # Send the inline keyboard to the user
        bot.edit_message_text(f"Upcoming Trains at {current_station}\n(Time:{input_time})\n ", chat_id, message_id, reply_markup=keyboard)

        print(f"Chat ID: {call.message.chat.id}")
        print(f"Current Station: {current_station}")
        # print(f"Platform 1 : {', '.join(next_closest_times_1)}")
        # print(f"Platform 2 : {', '.join(next_closest_times_2)}")

# Start the Telegram bot
bot.infinity_polling()