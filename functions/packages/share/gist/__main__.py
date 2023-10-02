import urllib.request

def main(args):
    url = "https://gist.githubusercontent.com/%s/raw/"
    response = urllib.request.urlopen(url % args.get("id"))
    text = response.read().decode('utf-8')
    return {
        "body": text,
    }
