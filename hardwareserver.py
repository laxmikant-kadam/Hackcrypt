from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/button", methods=["POST", "GET"])
def button_pressed():
    print("✅ Button pressed on ESP32!")
    return jsonify({"status": "success", "message": "Button event received"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
