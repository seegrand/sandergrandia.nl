<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @include('partials.head')
        @yield('head.additional')
    </head>

    <body>
        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
