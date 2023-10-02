from rentry import raw

def main(args):
    response = raw(args.get("id"))
    return {
        "body": response['content'],
        "statusCode": int(response['status'])
    }
