from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

# Add this route to serve the verification file
@app.route('/googlebfe4833e952a6934.html')
def google_verification():
    return send_from_directory('.', 'googlebfe4833e952a6934.html')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('.', 'sitemap.xml')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
