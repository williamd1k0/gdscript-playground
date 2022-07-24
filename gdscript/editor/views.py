import os
import json
from django.shortcuts import render, redirect
from django.http import JsonResponse

from .gdscript import GDSCriptCLI, GODOT_BINARY
from .godot_version import GODOT_VERSION
PROCESS_TIMEOUT = float(os.environ.get("PROCESS_TIMEOUT", "5"))

def root(request):
    return redirect('index')

def index(request):
    return render(request, 'playground.html', {'godot_version': GODOT_VERSION})

def script(request):
    code = request.POST.get('script')
    if code is not None:
        print(code)
        gds = GDSCriptCLI(GODOT_BINARY, json=True, timeout=PROCESS_TIMEOUT)
        output = gds.block(code, sys_exit=False)[0]
        return JsonResponse(json.loads(output))
    return redirect('index')
