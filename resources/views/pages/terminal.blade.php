@extends('html')

@section('title', '| Terminal')

@section('head.additional')
    <script src="{{ asset('js/terminal.js') }}" defer></script>
    <link rel="stylesheet" href="{{ asset('css/terminal.css') }}"/>
@endsection

@section('content')
    <div id='output-wrapper'></div>

    <div class='input-wrapper'>
        <span>$&nbsp;</span><input id='input' type='text' autofocus spellcheck="false"/>
    </div>
@endsection
