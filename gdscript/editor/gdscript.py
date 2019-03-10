"""
Meteor License

2019 - William Tumeo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to no conditions.

The above author notice and this permission notice can be included in all
copies or substantial portions of the Software, but only if you so desire.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

# WARN: This code is a bit messy, be careful
# TODO: Add an error handler
# TODO: Fix/Sync script line number (remaps)
# TODO: Improve script template
# TODO: Add documentation...
# TODO: Profit :P


import os
import subprocess
import sys
import re
from tempfile import gettempdir
from tempfile import NamedTemporaryFile as tempfile

__version__ = 0, 5, 0

VERBOSE1 = False # gdscript-cli logs
VERBOSE2 = False # default godot behavior
VERBOSE3 = False # godot verbose mode
GODOT_BINARY = os.environ.get('GODOT_BINARY', 'godot')
DEFAULT_OUTPUT = os.environ.get('DEFAULT_OUTPUT', 'windows')


def text_indent(text):
    indented = ''
    for line in text.split('\n'):
        indented += '    '+line+'\n'
    return indented.strip('\n')

# Regex to strip colors on Gnu/Linux
# Adapted from Colorama (https://github.com/tartley/colorama)
ANSI_CSI_RE = re.compile('\001?\033\\[((?:\\d|;)*)([a-zA-Z])\002?')
ANSI_OSC_RE = re.compile('\001?\033\\]((?:.|;)*?)(\x07)\002?')

def strip_osc(text):
    return ANSI_OSC_RE.sub('', text)

def strip_ansi(text):
    text = strip_osc(text)
    return ANSI_CSI_RE.sub('', text)



class GodotScript(object):

    MODE_EXTENDS = 0
    MODE_CLASS = 1
    MODE_SIMPLE = 2

    CLASS_BODY = """extends SceneTree
{body}
func _init():
    if {verbose}: prints('[gdscript]', '_init')
    if {timeout} == 0:
        var instance = {name}.new()
        root.add_child(instance)
        if {autoquit}:
            if {verbose}: prints('[gdscript]', 'autoquit')
            quit()
    else:
        if {verbose}: prints('[gdscript]', 'timeout mode')
        var timer = Timer.new()
        root.add_child(timer)
        timer.set_wait_time({timeout})
        timer.start()
        var instance = {name}.new()
        root.add_child(instance)
        yield(timer, 'timeout')
        quit()
    if {verbose}: prints('[gdscript]', '_init DONE')
"""

    EXTENDS_BODY = """class __GeneratedGodotClass__:
{body}
"""

    SIMPLE_BODY = """extends Node
func _ready():
{body}
"""

    def __init__(self, body, mode=0, name=None, timeout=0, path=None, autoquit=True):
        self._body = body
        self._name = name
        self.mode = mode
        self.timeout = timeout
        self.path = path
        self.autoquit = int(autoquit)
        self.map_lines = 1

    @property
    def body(self):
        if self.mode == self.MODE_CLASS:
            return self._body
        elif self.mode == self.MODE_EXTENDS:
            self.map_lines += 1
            return self.EXTENDS_BODY.format(body=text_indent(self._body))
        elif self.mode == self.MODE_SIMPLE:
            self.map_lines += 3
            return self.EXTENDS_BODY.format(
                body=text_indent(self.SIMPLE_BODY.format(
                    body=text_indent(self._body)
                ))
            )

    @property
    def name(self):
        return '__GeneratedGodotClass__' if self._name is None else self._name

    def full_body(self):
        return self.CLASS_BODY.format(
            body=self.body, name=self.name, timeout=self.timeout, autoquit=self.autoquit, verbose=int(VERBOSE1)
        )

    def __repr__(self):
        return self.full_body()

    @classmethod
    def from_simple(cls, body, timeout=0, autoquit=True):
        return cls(body, cls.MODE_SIMPLE, timeout=timeout, autoquit=autoquit)

    @classmethod
    def from_file(cls, path, mode, timeout=0, autoquit=True):
        with open(path, 'r', encoding='utf-8') as gds:
            body = gds.read()
            body = body.replace('\t', '    ')
        return cls(
            body, mode, timeout=timeout,
            path=os.path.dirname(os.path.abspath(path)),
            autoquit=autoquit
        )

    @classmethod
    def from_file_ex(cls, path, timeout=0, autoquit=True):
        return cls.from_file(path, cls.MODE_EXTENDS, timeout, autoquit)

    @classmethod
    def from_file_cls(cls, path, timeout=0, autoquit=True):
        raise NotImplementedError()
        # return cls.from_file(path, cls.MODE_CLASS, timeout)



class ScriptProcess(object):
    ROOT = os.path.dirname(os.path.abspath(sys.argv[0]))
    index = 0
    script_path = None
    godot_bin = ''

    def __init__(self, script_body, gdbin=None, window=False):
        self.script_body = script_body
        self.godot_bin = gdbin
        self.window = window

    @property
    def script(self):
        if self.script_path is None:
            path = None
            if self.script_body.path is not None:
                path = self.script_body.path
            temp = tempfile('w', encoding='utf-8', suffix='.gd', dir=path, delete=False)
            self.script_path = temp.name
            temp.close()
        return self.script_path

    @property
    def command(self):
        cmd = (
            self.godot_bin, '-s',
            os.path.join(os.path.abspath(os.getcwd()), self.script)
        )
        if self.script_body.path is not None:
            cmd = cmd + ('--path', self.script_body.path)
        if VERBOSE3:
            cmd = cmd + ('-v',)
        if VERBOSE2:
            print('GODOT COMMAND:', cmd)
        if not self.window: # and 'win' in sys.platform:
            cmd = cmd + ('--no-window',) # ignored in x11/MacOS
        return cmd


    def log_output(self):
        return open(os.path.join(gettempdir(), 'gdscript.log'), 'w')

    def save_script(self):
        with open(self.script, 'w', encoding='utf-8') as gds:
            gds.write(str(self.script_body))
        del gds

    def execute_script(self):
        process = subprocess.Popen(self.command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        output_list = []
        output_list_verbose = []
        re_ogl = re.compile(r'OpenGL ES [23]\.0 Renderer:')
        re_err = re.compile(r'\.gd:(\d+)')

        def push_output(txt):
        	print(txt)
        	output_list.append(txt)
        while True:
            ignore_next = False
            error = None
            for line in process.stdout.readlines():
                uline = strip_ansi(line.decode('utf-8')).strip()
                output_list_verbose.append(uline)
                if not ignore_next:
                    if VERBOSE2:
                        push_output(uline)
                    elif error is not None:
                        line_err = int(re_err.search(uline).group(1))
                        line_err -= self.script_body.map_lines
                        push_output(error)
                        push_output('\tAt: <script>:%s' % line_err)
                        error = None
                    else:
                        if 'SCRIPT ERROR: ' in uline:
                            error = uline.replace('SCRIPT ERROR: ', '').replace('GDScript::reload: ', '')
                        elif 'WARNING: ' in uline or 'ERROR: ' in uline:
                            if 'WARNING: cleanup: ObjectDB Instances still exist' in uline:
                                push_output('WARNING: Possible memory leak!')
                            ignore_next = True
                        elif re_ogl.match(uline) is None:
                            push_output(uline)
                else:
                    ignore_next = False
                sys.stdout.flush()
            if process.poll() is not None:
                break

        output = self.log_output()
        output_text = '\n'.join(output_list)
        output.write('\n'.join(output_list_verbose))
        output.close()
        os.unlink(self.script)
        return [output_text, process.returncode]

    def exec_godot_script(self):
        self.save_script()
        return self.execute_script()


class GDSCriptCLI(object):
    """
    GDSCript Command-Line implementation.
    """

    def __init__(self, godot, window=False):
        self._godot = godot
        self._window = window

    def _create_process(self, script):
        return ScriptProcess(script, self._godot, self._window)

    def oneline(self, code, timeout=0, autoquit=True, sys_exit=True):
        """Executes one line of code."""
        script = GodotScript.from_simple(code, timeout, autoquit)
        process = self._create_process(script)
        if sys_exit:
            sys.exit(process.exec_godot_script()[1])
        else:
            return process.exec_godot_script()

    def block(self, code, timeout=0, autoquit=True, sys_exit=True):
        """Executes a block of code."""
        if re.search(r'^extends\s', code, re.M) is None:
            return self.oneline(code, timeout=timeout, autoquit=autoquit, sys_exit=sys_exit)
        if True: # mode == 'extends':
            script = GodotScript(code, timeout=timeout, autoquit=autoquit)
        elif mode == 'class':
            script = GodotScript.from_file_cls(path, timeout, autoquit)
        process = self._create_process(script)
        if sys_exit:
            sys.exit(process.exec_godot_script()[1])
        else:
            return process.exec_godot_script()

    def eval(self, expression):
        """Evaluates a boolean expression."""
        code = 'OS.exit_code = 0 if bool({0}) else 1'.format(expression)
        self.oneline(code)

    def print(self, expression):
        """Prints a expression."""
        code = 'print({0})'.format(expression)
        self.oneline(code, sys_exit=False)

    def file(self, path, mode='extends', timeout=0, autoquit=True):
        """Executes a script file <script.gd>."""
        # TODO: Add automatic mode check
        if mode == 'extends':
            script = GodotScript.from_file_ex(path, timeout, autoquit)
        elif mode == 'class':
            script = GodotScript.from_file_cls(path, timeout, autoquit)
        process = self._create_process(script)
        sys.exit(process.exec_godot_script()[1])



if __name__ == '__main__':
    if '--version' in sys.argv:
        print('GDScript CLI Wrapper: v%s.%s.%s by William Tumeo' % __version__)
        try:
            subprocess.run([GODOT_BINARY, '--version'], check=True, stdout=subprocess.PIPE)
        except subprocess.CalledProcessError as perr:
            print('Godot Engine: %s' % perr.output.decode('utf-8'))
        sys.exit(0)

    import argparse

    parser = argparse.ArgumentParser('gdscript', description='GDScript CLI Wrapper', usage='%(prog)s [-epqw] [-t <seconds>] [-v] input\n -h/--help: show help message')
    parser.add_argument('input', type=str, help='input script (program passed in as string or file)')
    parser.add_argument('-e', '--eval', action='store_true', help='evaluate a boolean expression (exit code)')
    parser.add_argument('-p', '--print', action='store_true', help='print a simple expression')
    parser.add_argument('-q', '--quit-manually', action='store_true', help='call get_tree().quit() manually (if using Timer or _process)')
    parser.add_argument('-t', '--timeout', type=float, default=0, metavar='<seconds>', help='process timeout (if using Timer or _process)')
    parser.add_argument('-w', '--window', action='store_true', help='show godot window (default behavior on X11/MacOS)')
    parser.add_argument('-v', '--verbose', action='count', default=0, help='verbose level (wrapper or default Godot behavior)')
    parser.add_argument('--version', action='store_true', help='print version info')
    # parser.add_argument('-m', '--mode', type=str, default='extends', help='Not implemented yed (ignore it)')

    args = parser.parse_args()
    VERBOSE1 = args.verbose > 0
    VERBOSE2 = args.verbose > 1
    VERBOSE3 = args.verbose > 2
    GD = GDSCriptCLI(GODOT_BINARY, args.window)
    INPUT = args.input
    if args.input == '-':
        if VERBOSE1: print('[gdscript] Reading from STDIN')
        INPUT = '\n'.join(sys.stdin.readlines())
    if args.print:
        GD.print(INPUT)
    if args.eval:
        GD.eval(INPUT)
    elif args.input.endswith('.gd'):
        GD.file(INPUT, 'extends', args.timeout, not args.quit_manually)
    elif not args.print:
        GD.block(INPUT, args.timeout, not args.quit_manually)
