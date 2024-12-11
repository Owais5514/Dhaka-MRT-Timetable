# Dhaka-MRT-Timetable
Unofficial Dhaka MRT-6 Time schedule through telegram bot

## Setup
### Prerequisites
- Python 3.8 or higher
- Telegram Bot API token

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Dhaka-MRT-Timetable.git
    cd Dhaka-MRT-Timetable
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```sh
    pip install -r requirements.txt
    ```

### Configuration
1. Create a `.env` file in the root directory and add your Telegram Bot API token:
    ```env
    TELEGRAM_API_TOKEN=your_telegram_api_token
    ```

### Running the Bot
1. Start the bot:
    ```sh
    python bot.py
    ```

2. Your bot should now be running and ready to use.
