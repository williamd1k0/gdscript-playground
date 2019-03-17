
from django.shortcuts import render, redirect
from django.http import HttpResponse

from .gdscript import GDSCriptCLI, GODOT_BINARY


def root(request):
    return redirect('index')


def index(request):
    return render(request, 'playground.html')

def script(request):
    code = request.POST.get('script')
    if code is not None:
        print(code)
        gds = GDSCriptCLI(GODOT_BINARY)
        output = gds.block(code, timeout=0, sys_exit=False)[0]
        return HttpResponse(output)
    return redirect('index')
