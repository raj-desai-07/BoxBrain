from django.shortcuts import redirect


def login_required(view):
    def wrapper(request, *args, **kwargs):

        if 'email' not in request.session:
            return redirect('/login/')

        return view(request, *args, **kwargs)

    return wrapper