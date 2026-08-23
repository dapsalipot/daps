<?php

namespace App\Http\Controllers;

use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('projects/index');
    }

    public function show(string $slug): Response
    {
        $projects = config('portfolio.projects');
        $project = Arr::first($projects, fn ($p) => $p['slug'] === $slug);
        if (! $project) {
            throw new NotFoundHttpException("Project [$slug] not found.");
        }

        return Inertia::render('projects/show', ['project' => $project]);
    }
}
