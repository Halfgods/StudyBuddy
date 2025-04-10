from flask import Flask,session, render_template, request, jsonify
from youtube.YTlogic import search_youtube , reset_search



app = Flask(__name__)
app.secret_key = "123"

@app.route("/", methods=["GET", "POST"])
def home(): 
    videos = []
    error_message = None 
    
    if request.method == "POST":
        query = request.form.get("query")
        videos = search_youtube(query)
        if videos is None:
            error_message = "❌ No results found. Try again with a different search!"

    return render_template("index.html", videos=videos, error_message=error_message)


@app.route("/youtube", methods=["GET", "POST"])
def youtube_page(): 
    videos = []
    error_message = None 

    if request.method == "POST":
        query = request.form.get("query")
        videos = search_youtube(query)
        if videos is None:
            error_message = "❌ No results found. Try again with a different search!"

    return render_template("youtube.html", videos=videos, error_message=error_message)


@app.route("/api/search", methods=["POST"])
def api_search():
    query = request.json.get("query")
    videos = search_youtube(query)
    return jsonify(videos)

@app.route("/suggest", methods=["POST"])
def suggest():
    data = request.get_json()
    selected_title = data.get("title")

    if not selected_title:
        return jsonify({"error": "No title provided"}), 400

    print(f"📩 Suggestion request for: {selected_title}")
    suggestions = search_youtube(selected_title)

    if suggestions:
        return jsonify(suggestions)
    else:
        return jsonify({"error": "No suggestions found"}), 404


@app.route("/reset", methods=["POST"])
def reset():
    print("🔁 Reset called from frontend")
    return jsonify({"status": "reset successful"})

@app.route("/gaming")
def game_mode():
    # Serve the Game Mode page
    return render_template('game.html')

if __name__ == "__main__":
    app.run(debug=True)
